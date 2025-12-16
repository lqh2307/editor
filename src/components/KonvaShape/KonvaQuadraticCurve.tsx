import { parseHexToRGBAString } from "../../utils/Color";
import { Circle, Line } from "react-konva";
import { Vector2d } from "konva/lib/types";
import { Portal } from "react-konva-utils";
import Konva from "konva";
import React from "react";
import {
  KonvaShapeProp,
  KonvaShapeAPI,
  RenderReason,
  KonvaShape,
} from "./Types";
import {
  createShapeBox,
  transformPoint,
  createLineDash,
  invertPoint,
} from "../../utils/Shapes";

export const KonvaQuadraticCurve = React.memo(
  (prop: KonvaShapeProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Line>(undefined);
    const currentPropRef = React.useRef<KonvaShapeProp>(prop);
    const [isEnabled, setIsEnabled] = React.useState<boolean>(false);

    // Store control
    const defaultLineDashRef = React.useRef<number[]>([10, 10, 0, 10]);
    const lineNodeRef = React.useRef<Konva.Line>(undefined);
    const controlNodeRef = React.useRef<Record<string, Konva.Circle>>({});

    // Apply prop
    const applyProp = React.useCallback((reason?: RenderReason): void => {
      const prop: KonvaShapeProp = currentPropRef.current;
      const shapeOption: KonvaShape = prop.shapeOption;

      const node: Konva.Line = nodeRef.current;
      if (node) {
        // Update node attrs
        node.setAttrs({
          ...shapeOption,
          draggable: shapeOption.draggable && prop.isSelected,
          hitStrokeWidth: shapeOption.hitStrokeWidth ?? 20,
          fill: parseHexToRGBAString(
            shapeOption.fill as string,
            shapeOption.fillOpacity
          ),
          stroke: parseHexToRGBAString(
            shapeOption.stroke as string,
            shapeOption.strokeOpacity
          ),
          dash: createLineDash(shapeOption.lineStyle),
        });

        // Update shape box
        shapeOption.box = createShapeBox(node);
      }

      // Update controll attrs
      lineNodeRef.current?.setAttrs({
        visible: prop.isEditted,
        rotation: shapeOption.rotation,
        scaleX: shapeOption.scaleX,
        scaleY: shapeOption.scaleY,
        skewX: shapeOption.skewX,
        skewY: shapeOption.skewY,
        x: shapeOption.x,
        y: shapeOption.y,
        offsetX: shapeOption.offsetX,
        offsetY: shapeOption.offsetY,
        points: shapeOption.points,
      });

      for (let idx = 0; idx < shapeOption.points.length; idx += 2) {
        controlNodeRef.current[`${shapeOption.id}-${idx}`]?.setAttrs({
          visible: prop.isEditted,
          ...transformPoint(
            {
              x: shapeOption.points[idx],
              y: shapeOption.points[idx + 1],
            },
            shapeOption
          ),
        });
      }

      // Call callback function
      prop.onAppliedProp?.(shapeAPI, reason);
    }, []);

    // Update prop
    const updateProp = React.useCallback((prop?: KonvaShapeProp): void => {
      if (prop) {
        Object.assign(currentPropRef.current, prop);
      }

      applyProp("apply-prop");
    }, []);

    // Update shape
    const updateShape = React.useCallback((shape?: KonvaShape): void => {
      if (shape) {
        Object.assign(currentPropRef.current.shapeOption, shape);
      }

      applyProp("apply-prop");
    }, []);

    // Get stage
    const getStage = React.useCallback((): Konva.Stage => {
      return nodeRef.current?.getStage();
    }, []);

    // Get node
    const getNode = React.useCallback((): Konva.Line => {
      return nodeRef.current;
    }, []);

    // Get prop
    const getShape = React.useCallback((): KonvaShape => {
      return currentPropRef.current.shapeOption;
    }, []);

    // Shape API
    const shapeAPI: KonvaShapeAPI = React.useMemo(
      () => ({
        updateProp,
        updateShape,
        getStage,
        getNode,
        getShape,
      }),
      []
    );

    // Update shape
    React.useEffect(() => {
      currentPropRef.current = prop;

      applyProp("apply-prop");

      // Call callback function
      prop.onMounted?.(prop.shapeOption.id, shapeAPI);

      return () => {
        // Call callback function
        prop.onUnMounted?.(prop.shapeOption.id);
      };
    }, [prop]);

    const handleClick = React.useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>): void => {
        // Call callback function
        currentPropRef.current.onClick?.(e, shapeAPI);
      },
      []
    );

    const handleDblClick = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onDblClick?.(shapeAPI);
    }, []);

    const handleMouseDown = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onMouseDown?.(shapeAPI);
    }, []);

    const handleMouseUp = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onMouseUp?.(shapeAPI);
    }, []);

    const handleControlDragStart = React.useCallback((): void => {
      setIsEnabled(true);
    }, []);

    const handleControlDragMove = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Circle = e.target as Konva.Circle;
        if (node) {
          const id: string = node.id();

          if (controlNodeRef.current[id]) {
            const shapeOption: KonvaShape = currentPropRef.current.shapeOption;
            const newPoint: Vector2d = invertPoint(
              node.position(),
              shapeOption
            );

            const idx: number = Number(id.slice(id.lastIndexOf("-") + 1));

            if (idx === 4) {
              shapeOption.points[2] = newPoint.x;
              shapeOption.points[3] = newPoint.y;
              shapeOption.points[4] = newPoint.x;
              shapeOption.points[5] = newPoint.y;
            } else {
              shapeOption.points[idx] = newPoint.x;
              shapeOption.points[idx + 1] = newPoint.y;
            }

            nodeRef.current?.points(shapeOption.points);
            lineNodeRef.current?.points(shapeOption.points);
          }
        }
      },
      []
    );

    const handleControlDragEnd = React.useCallback((): void => {
      setIsEnabled(false);

      // Call callback function
      applyProp("control-drag-end");
    }, []);

    const handleDragStart = React.useCallback((): void => {
      setIsEnabled(true);
    }, []);

    const handleDragMove = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Line = e.target as Konva.Line;
        if (node) {
          const shapeOption: KonvaShape = currentPropRef.current.shapeOption;
          const newPosition: Vector2d = node.position();

          Object.assign(shapeOption, {
            x: newPosition.x,
            y: newPosition.y,
            box: createShapeBox(node),
          });

          lineNodeRef.current?.position(newPosition);

          for (let idx = 0; idx < shapeOption.points.length; idx += 2) {
            controlNodeRef.current[`${shapeOption.id}-${idx}`]?.position(
              transformPoint(
                {
                  x: shapeOption.points[idx],
                  y: shapeOption.points[idx + 1],
                },
                shapeOption
              )
            );
          }
        }

        // Call callback function
        currentPropRef.current.onDragMove?.(shapeAPI);
      },
      []
    );

    const handleDragEnd = React.useCallback((): void => {
      setIsEnabled(false);

      // Call callback function
      currentPropRef.current.onAppliedProp?.(shapeAPI, "drag-end");
    }, []);

    const handleTransform = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Line = e.target as Konva.Line;
        if (node) {
          const shapeOption: KonvaShape = currentPropRef.current.shapeOption;

          const newAttrs: KonvaShape = {
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            skewX: node.skewX(),
            skewY: node.skewY(),
            x: node.x(),
            y: node.y(),
          };

          Object.assign(shapeOption, newAttrs);

          lineNodeRef.current?.setAttrs(newAttrs);

          for (let idx = 0; idx < shapeOption.points.length; idx += 2) {
            controlNodeRef.current[`${shapeOption.id}-${idx}`]?.position(
              transformPoint(
                {
                  x: shapeOption.points[idx],
                  y: shapeOption.points[idx + 1],
                },
                shapeOption
              )
            );
          }
        }
      },
      []
    );

    const handleTransformEnd = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onAppliedProp?.(shapeAPI, "transform-end");
    }, []);

    const handleMouseOver = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onMouseOver?.(shapeAPI);
    }, []);

    const handleMouseLeave = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onMouseLeave?.(shapeAPI);
    }, []);

    return (
      <Portal selector={"#shapes"} enabled={isEnabled}>
        <Line
          listening={true}
          ref={nodeRef}
          onClick={handleClick}
          onDblClick={handleDblClick}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onTransform={handleTransform}
          onTransformEnd={handleTransformEnd}
        />

        <Line
          id={`${prop.shapeOption.id}-line`}
          listening={true}
          ref={lineNodeRef}
          points={undefined}
          stroke={"#555555"}
          strokeWidth={1}
          fill={"#555555"}
          opacity={0.75}
          dash={defaultLineDashRef.current}
        />

        {prop.shapeOption.points.map((_, idx) => {
          if (idx % 2 === 0) {
            if (idx === 2) {
              return;
            }

            const id: string = `${prop.shapeOption.id}-${idx}`;

            return (
              <Circle
                id={id}
                key={id}
                listening={true}
                ref={(node: Konva.Circle): void => {
                  if (node) {
                    if (!controlNodeRef.current[id]) {
                      controlNodeRef.current[id] = node;
                    }
                  } else {
                    delete controlNodeRef.current[id];
                  }
                }}
                draggable={true}
                radius={10}
                stroke={"#555555"}
                strokeWidth={1}
                fill={"#dddddd"}
                onMouseOver={handleMouseOver}
                onMouseLeave={handleMouseLeave}
                onDragStart={handleControlDragStart}
                onDragMove={handleControlDragMove}
                onDragEnd={handleControlDragEnd}
              />
            );
          } else {
            return;
          }
        })}
      </Portal>
    );
  }
);
