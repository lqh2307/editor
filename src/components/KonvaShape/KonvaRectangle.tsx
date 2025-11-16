import { parseHexToRGBAString } from "../../utils/Color";
import { KonvaShape, KonvaShapeProp } from "./Types";
import { createShapeBox } from "../../utils/Shapes";
import { Portal } from "react-konva-utils";
import { Rect } from "react-konva";
import Konva from "konva";
import React from "react";

export const KonvaRectangle = React.memo(
  (prop: KonvaShapeProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Rect>(undefined);
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
      const node: Konva.Rect = nodeRef.current;
      if (!node) {
        return;
      }

      const prop: KonvaShapeProp = currentPropRef.current;
      const shapeOption: KonvaShape = prop.shapeOption;

      // Update node attrs
      node.setAttrs({
        ...shapeOption,
        draggable: prop.isSelected,
        fill: parseHexToRGBAString(
          shapeOption.fill as string,
          shapeOption.fillOpacity
        ),
        stroke: parseHexToRGBAString(
          shapeOption.stroke as string,
          shapeOption.strokeOpacity
        ),
      });

      // Update shape box
      shapeOption.box = createShapeBox(node);

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
    const getNode = React.useCallback((): Konva.Rect => {
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
        const node: Konva.Rect = e.target as Konva.Rect;
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

        const node: Konva.Rect = e.target as Konva.Rect;
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
        const node: Konva.Rect = e.target as Konva.Rect;
        if (!node) {
          return;
        }

        const scaleX: number = node.scaleX();
        const scaleY: number = node.scaleY();

        const newScaleX: number = scaleX < 0 ? -1 : 1;
        const newScaleY: number = scaleY < 0 ? -1 : 1;

        const prop: KonvaShapeProp = currentPropRef.current;
        const shapeOption: KonvaShape = prop.shapeOption;

        const newWidth: number = Math.round(
          shapeOption.width * scaleX * newScaleX
        );
        const newHeight: number = Math.round(
          shapeOption.height * scaleY * newScaleY
        );

        Object.assign(shapeOption, {
          width: newWidth,
          height: newHeight,
          rotation: node.rotation(),
          scaleX: newScaleX,
          scaleY: newScaleY,
          x: node.x(),
          y: node.y(),
          offsetX: newWidth / 2,
          offsetY: newHeight / 2,
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
        <Rect
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
