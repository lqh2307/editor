import { parseHexToRGBAString } from "../../utils/Color";
import { KonvaShape, KonvaShapeProp } from "./Types";
import { createShapeBox } from "../../utils/Shapes";
import { Portal } from "react-konva-utils";
import { Line } from "react-konva";
import Konva from "konva";
import React from "react";

export const KonvaLine = React.memo(
  (prop: KonvaShapeProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Line>(undefined);
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
      const node: Konva.Line = nodeRef.current;
      if (!node) {
        return;
      }

      const prop: KonvaShapeProp = currentPropRef.current;

      // Update node attrs
      node.setAttrs({
        ...prop.shapeOption,
        draggable: prop.isSelected,
        fill: parseHexToRGBAString(
          prop.shapeOption.fill as string,
          prop.shapeOption.fillOpacity
        ),
        stroke: parseHexToRGBAString(
          prop.shapeOption.stroke as string,
          prop.shapeOption.strokeOpacity
        ),
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
    const getNode = React.useCallback((): Konva.Line => {
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
        const node: Konva.Line = e.target as Konva.Line;
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

        const node: Konva.Line = e.target as Konva.Line;
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
        const node: Konva.Line = e.target as Konva.Line;
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

        let scaleAbs: number;

        if (
          Number(scaleXAbs.toPrecision(9)) >= 1 &&
          Number(scaleYAbs.toPrecision(9)) >= 1
        ) {
          scaleAbs = scaleXAbs > scaleYAbs ? scaleXAbs : scaleYAbs;
        } else {
          scaleAbs = scaleXAbs < scaleYAbs ? scaleXAbs : scaleYAbs;
        }

        Object.assign(prop.shapeOption, {
          strokeWidth: Math.round(prop.shapeOption.strokeWidth * scaleAbs),
          points: prop.shapeOption.points.map((point, idx) =>
            idx % 2 === 0 ? point * scaleXAbs : point * scaleYAbs
          ),
          rotation: node.rotation(),
          scaleX: newScaleX,
          scaleY: newScaleY,
          x: node.x(),
          y: node.y(),
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
        <Line
          listening={true}
          ref={nodeRef}
          points={undefined}
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
