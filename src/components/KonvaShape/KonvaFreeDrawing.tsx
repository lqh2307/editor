import { parseHexToRGBAString } from "../../utils/Color";
import { KonvaShapeProp, KonvaShape } from "./Types";
import { createShapeBox } from "../../utils/Shapes";
import { Portal } from "react-konva-utils";
import { Group } from "react-konva";
import React from "react";
import Konva from "konva";
import { constants } from "node:sqlite";

export const KonvaFreeDrawing = React.memo(
  (prop: KonvaShapeProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Group>(undefined);
    const currentPropRef = React.useRef<KonvaShapeProp>(prop);
    const [isEnabled, setIsEnabled] = React.useState<boolean>(false);

    React.useEffect(() => {
      currentPropRef.current = prop;

      applyProp();

      // Call callback function
      prop.onMounted?.(prop.shapeOption.id, {
        updateProp,
        updateShape,
        getNode,
        getShape,
      });

      return () => {
        // Call callback function
        prop.onUnMounted?.(prop.shapeOption.id);
      };
    }, [prop]);

    // Apply prop
    const applyProp = React.useCallback((): void => {
      const node: Konva.Group = nodeRef.current;
      if (!node) {
        return;
      }

      const prop: KonvaShapeProp = currentPropRef.current;

      // Process node attrs
      const {
        id,
        x,
        y,
        scaleX,
        scaleY,
        rotation,
        lines,
        ...lineOption
      }: KonvaShape = prop.shapeOption;

      lineOption.fill = parseHexToRGBAString(
        lineOption.fill as string,
        lineOption.fillOpacity
      );

      lineOption.stroke = parseHexToRGBAString(
        lineOption.stroke as string,
        lineOption.strokeOpacity
      );

      node.destroyChildren();

      // Add lines
      lines.forEach((item) => {
        node.add(
          new Konva.Line({
            ...item,
            ...lineOption,
            listening: true,
            draggable: false,
            key: item.id,
          })
        );
      });

      // Update node attrs
      node.setAttrs({
        ...prop.shapeOption,
        id: id,
        x: x,
        y: y,
        scaleX: scaleX,
        scaleY: scaleY,
        rotation: rotation,
        draggable: prop.isSelected,
      });

      // Update shape box
      prop.shapeOption.box = createShapeBox(node);

      // Call callback function
      prop.onAppliedProp?.(
        {
          updateProp,
          updateShape,
          getNode,
          getShape,
        },
        "apply-prop"
      );
    }, []);

    // Update prop
    const updateProp = React.useCallback((prop?: KonvaShapeProp): void => {
      if (prop) {
        Object.assign(currentPropRef.current, prop);
      }

      applyProp();
    }, []);

    // Update shape
    const updateShape = React.useCallback((shape?: KonvaShape): void => {
      if (shape) {
        Object.assign(currentPropRef.current.shapeOption, shape);
      }

      applyProp();
    }, []);

    // Get node
    const getNode = React.useCallback((): Konva.Group => {
      return nodeRef.current;
    }, []);

    // Get prop
    const getShape = React.useCallback((): KonvaShape => {
      return currentPropRef.current.shapeOption;
    }, []);

    const handleClick = React.useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>): void => {
        // Call callback function
        currentPropRef.current.onClick?.(e, {
          updateProp,
          updateShape,
          getNode,
          getShape,
        });
      },
      []
    );

    const handleDragMove = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Group = e.target as Konva.Group;
        if (!node) {
          return;
        }

        const prop: KonvaShapeProp = currentPropRef.current;

        Object.assign(prop.shapeOption, {
          ...node.position(),
          box: createShapeBox(node),
        });

        // Call callback function
        prop.onDragMove?.({
          updateProp,
          updateShape,
          getNode,
          getShape,
        });
      },
      []
    );

    const handleDragEnd = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        setIsEnabled(false);

        const node: Konva.Group = e.target as Konva.Group;
        if (!node) {
          return;
        }

        const prop: KonvaShapeProp = currentPropRef.current;

        Object.assign(prop.shapeOption, {
          ...node.position(),
          box: createShapeBox(node),
        });

        // Call callback function
        prop.onAppliedProp?.(
          {
            updateProp,
            updateShape,
            getNode,
            getShape,
          },
          "drag-end"
        );
      },
      []
    );

    const handleTransformEnd = React.useCallback(
      (e: Konva.KonvaEventObject<Event>): void => {
        const node: Konva.Group = e.target as Konva.Group;
        if (!node) {
          return;
        }

        const scaleX: number = node.scaleX();
        const scaleY: number = node.scaleY();

        const newScaleX: number = scaleX < 0 ? -1 : 1;
        const newScaleY: number = scaleY < 0 ? -1 : 1;

        const scaleXAbs = scaleX * newScaleX;
        const scaleYAbs = scaleY * newScaleY;

        const prop: KonvaShapeProp = currentPropRef.current;

        let strokeWidth: number;

        if (scaleXAbs.toPrecision(5) === scaleYAbs.toPrecision(5)) {
          strokeWidth = Math.round(prop.shapeOption.strokeWidth * scaleXAbs);

          if (strokeWidth < 1) {
            strokeWidth = 1;
          }
        } else {
          strokeWidth = prop.shapeOption.strokeWidth;
        }

        Object.assign(prop.shapeOption, {
          strokeWidth: strokeWidth,
          rotation: node.rotation(),
          scaleX: newScaleX,
          scaleY: newScaleY,
          x: node.x(),
          y: node.y(),
        });

        prop.shapeOption.lines.forEach((line) => {
          line.points.forEach((point, idx) => {
            line.points[idx] =
              idx % 2 === 0 ? point * scaleXAbs : point * scaleYAbs;
          });
        });

        // Call callback function
        prop.onAppliedProp?.(
          {
            updateProp,
            updateShape,
            getNode,
            getShape,
          },
          "transform-end"
        );
      },
      []
    );

    const handleMouseOver = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onMouseOver?.({
        updateProp,
        updateShape,
        getNode,
        getShape,
      });
    }, []);

    const handleMouseLeave = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onMouseLeave?.({
        updateProp,
        updateShape,
        getNode,
        getShape,
      });
    }, []);

    return (
      <Portal selector={"#shapes"} enabled={isEnabled}>
        <Group
          listening={true}
          ref={nodeRef}
          onClick={handleClick}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        />
      </Portal>
    );
  }
);
