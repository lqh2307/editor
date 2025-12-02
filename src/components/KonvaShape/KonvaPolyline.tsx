import { KonvaShape, KonvaShapeAPI, KonvaShapeProp } from "./Types";
import { parseHexToRGBAString } from "../../utils/Color";
import { createShapeBox } from "../../utils/Shapes";
import { Portal } from "react-konva-utils";
import { Line } from "react-konva";
import Konva from "konva";
import React from "react";

export const KonvaPolyline = React.memo(
  (prop: KonvaShapeProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Line>(undefined);
    const currentPropRef = React.useRef<KonvaShapeProp>(prop);
    const [isEnabled, setIsEnabled] = React.useState<boolean>(false);

    const applyProp = React.useCallback((): void => {
      const node: Konva.Line = nodeRef.current;
      if (node) {
        const prop: KonvaShapeProp = currentPropRef.current;
        const shapeOption: KonvaShape = prop.shapeOption;

        node.setAttrs({
          ...shapeOption,
          draggable: prop.isSelected,
          hitStrokeWidth: shapeOption.hitStrokeWidth ?? 20,
          fill: parseHexToRGBAString(
            shapeOption.fill as string,
            shapeOption.fillOpacity
          ),
          stroke: parseHexToRGBAString(
            shapeOption.stroke as string,
            shapeOption.strokeOpacity
          ),
          // Ensure polyline has points array
          points: shapeOption.points ?? [],
        });

        shapeOption.box = createShapeBox(node);
      }

      prop.onAppliedProp?.(shapeAPI, "apply-prop");
    }, []);

    const updateProp = React.useCallback((prop?: KonvaShapeProp): void => {
      if (prop) {
        Object.assign(currentPropRef.current, prop);
      }
      applyProp();
    }, []);

    const updateShape = React.useCallback((shape?: KonvaShape): void => {
      if (shape) {
        Object.assign(currentPropRef.current.shapeOption, shape);
      }
      applyProp();
    }, []);

    const getStage = React.useCallback((): Konva.Stage => {
      const node: Konva.Line = nodeRef.current;
      if (node) return node.getStage();
    }, []);

    const getNode = React.useCallback((): Konva.Line => nodeRef.current, []);
    const getShape = React.useCallback(
      (): KonvaShape => currentPropRef.current.shapeOption,
      []
    );

    const shapeAPI: KonvaShapeAPI = React.useMemo(
      () => ({ updateProp, updateShape, getStage, getNode, getShape }),
      []
    );

    React.useEffect(() => {
      currentPropRef.current = prop;
      applyProp();
      prop.onMounted?.(prop.shapeOption.id, shapeAPI);
      return () => prop.onUnMounted?.(prop.shapeOption.id);
    }, [prop]);

    const handleClick = React.useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>): void => {
        currentPropRef.current.onClick?.(e, shapeAPI);
      },
      []
    );

    const handleDragMove = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Line = e.target as Konva.Line;
        if (node) {
          Object.assign(currentPropRef.current.shapeOption, {
            x: node.x(),
            y: node.y(),
            box: createShapeBox(node),
          });
        }
        currentPropRef.current.onDragMove?.(shapeAPI);
      },
      []
    );

    const handleDragEnd = React.useCallback((): void => {
      setIsEnabled(false);
      currentPropRef.current.onAppliedProp?.(shapeAPI, "drag-end");
    }, []);

    const handleTransformEnd = React.useCallback(
      (e: Konva.KonvaEventObject<Event>): void => {
        const node: Konva.Line = e.target as Konva.Line;
        if (node) {
          Object.assign(currentPropRef.current.shapeOption, {
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            skewX: node.skewX(),
            skewY: node.skewY(),
            x: node.x(),
            y: node.y(),
          });
        }
        currentPropRef.current.onAppliedProp?.(shapeAPI, "transform-end");
      },
      []
    );

    const handleMouseOver = React.useCallback((): void => {
      currentPropRef.current.onMouseOver?.(shapeAPI);
    }, []);

    const handleMouseLeave = React.useCallback((): void => {
      currentPropRef.current.onMouseLeave?.(shapeAPI);
    }, []);

    return (
      <Portal selector="#shapes" enabled={isEnabled}>
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
