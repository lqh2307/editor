import { KonvaShape, KonvaShapeAPI, KonvaShapeProp } from "./Types";
import { parseHexToRGBAString } from "../../utils/Color";
import { createShapeBox, transformPoint, invertPoint } from "../../utils/Shapes";
import { Portal } from "react-konva-utils";
import { Line, Circle } from "react-konva";
import Konva from "konva";
import React from "react";

export const KonvaPolyline = React.memo(
  (prop: KonvaShapeProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Line>(undefined);
    const currentPropRef = React.useRef<KonvaShapeProp>(prop);
    const [isEnabled, setIsEnabled] = React.useState<boolean>(false);
    const anchorRefs = React.useRef<Record<string, Konva.Circle>>({});

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

          // Update anchor positions while dragging
          const shapeOption: KonvaShape = currentPropRef.current.shapeOption;
          const pts = shapeOption.points ?? [];
          for (let i = 0; i < pts.length; i += 2) {
            const id = `${shapeOption.id}-anchor-${i / 2}`;
            const anchor = anchorRefs.current[id];
            if (anchor) {
              const p = transformPoint({ x: pts[i], y: pts[i + 1] }, shapeOption);
              anchor.position(p);
              anchor.offsetX(shapeOption.offsetX);
              anchor.offsetY(shapeOption.offsetY);
              anchor.visible(Boolean(currentPropRef.current.isSelected));
            }
          }
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

          // Reposition anchors after transform
          const shapeOption: KonvaShape = currentPropRef.current.shapeOption;
          const pts = shapeOption.points ?? [];
          for (let i = 0; i < pts.length; i += 2) {
            const id = `${shapeOption.id}-anchor-${i / 2}`;
            const anchor = anchorRefs.current[id];
            if (anchor) {
              const p = transformPoint({ x: pts[i], y: pts[i + 1] }, shapeOption);
              anchor.position(p);
            }
          }
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

    const handleAnchorDragMove = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Circle = e.target as Konva.Circle;
        if (node) {
          const shapeOption: KonvaShape = currentPropRef.current.shapeOption;
          const id = node.id() || "";
          const idxStr = id.split("-anchor-")[1];
          const idx = Number(idxStr);
          if (!isNaN(idx)) {
            const local = invertPoint(node.position(), shapeOption);
            const pts = shapeOption.points ?? [];
            const i = idx * 2;
            pts[i] = local.x;
            pts[i + 1] = local.y;
            shapeOption.points = pts;
            // Update main line points immediately
            nodeRef.current?.points(pts);
          }
        }
      },
      []
    );

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

        {/* Anchors for each vertex */}
        {(() => {
          const shapeOption: KonvaShape = prop.shapeOption;
          const pts = shapeOption.points ?? [];
          const circles: React.JSX.Element[] = [];
          for (let i = 0; i < pts.length; i += 2) {
            const local = { x: pts[i], y: pts[i + 1] };
            const p = transformPoint(local, shapeOption);
            const id = `${shapeOption.id}-anchor-${i / 2}`;
            circles.push(
              <Circle
                key={id}
                id={id}
                listening={true}
                ref={(el) => {
                  if (el) anchorRefs.current[id] = el as unknown as Konva.Circle;
                }}
                draggable={prop.isSelected}
                visible={prop.isSelected}
                offsetX={shapeOption.offsetX}
                offsetY={shapeOption.offsetY}
                x={p.x}
                y={p.y}
                radius={8}
                stroke={"#555555"}
                strokeWidth={1}
                fill={"#dddddd"}
                onMouseOver={handleMouseOver}
                onMouseLeave={handleMouseLeave}
                onDragMove={handleAnchorDragMove}
              />
            );
          }
          return circles;
        })()}
      </Portal>
    );
  }
);
