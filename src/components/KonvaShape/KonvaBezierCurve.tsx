import { KonvaShapeProp, KonvaShapeAPI, KonvaShape } from "./Types";
import { parseHexToRGBAString } from "../../utils/Color";
import { Vector2d } from "konva/lib/types";
import { Portal } from "react-konva-utils";
import { Circle, Line } from "react-konva";
import Konva from "konva";
import React from "react";
import {
  createShapeBox,
  transformPoint,
  invertPoint,
} from "../../utils/Shapes";

export const KonvaBezierCurve = React.memo(
  (prop: KonvaShapeProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Line>(undefined);
    const currentPropRef = React.useRef<KonvaShapeProp>(prop);
    const [isEnabled, setIsEnabled] = React.useState<boolean>(false);

    // Store control
    const lineNodeRef = React.useRef<Konva.Line>(undefined);
    const startNodeRef = React.useRef<Konva.Circle>(undefined);
    const control1NodeRef = React.useRef<Konva.Circle>(undefined);
    const control2NodeRef = React.useRef<Konva.Circle>(undefined);
    const endNodeRef = React.useRef<Konva.Circle>(undefined);

    // Apply prop
    const applyProp = React.useCallback((): void => {
      const prop: KonvaShapeProp = currentPropRef.current;
      const shapeOption: KonvaShape = currentPropRef.current.shapeOption;

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
        });

        // Update shape box
        shapeOption.box = createShapeBox(node);
      }

      // Update controll attrs
      lineNodeRef.current?.setAttrs({
        visible: prop.isSelected,
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

      startNodeRef.current?.setAttrs({
        visible: prop.isSelected,
        offsetX: shapeOption.offsetX,
        offsetY: shapeOption.offsetY,
        ...transformPoint(
          {
            x: shapeOption.points[0],
            y: shapeOption.points[1],
          },
          shapeOption
        ),
      });

      control1NodeRef.current?.setAttrs({
        visible: prop.isSelected,
        offsetX: shapeOption.offsetX,
        offsetY: shapeOption.offsetY,
        ...transformPoint(
          {
            x: shapeOption.points[2],
            y: shapeOption.points[3],
          },
          shapeOption
        ),
      });

      control2NodeRef.current?.setAttrs({
        visible: prop.isSelected,
        offsetX: shapeOption.offsetX,
        offsetY: shapeOption.offsetY,
        ...transformPoint(
          {
            x: shapeOption.points[4],
            y: shapeOption.points[5],
          },
          shapeOption
        ),
      });

      endNodeRef.current?.setAttrs({
        visible: prop.isSelected,
        offsetX: shapeOption.offsetX,
        offsetY: shapeOption.offsetY,
        ...transformPoint(
          {
            x: shapeOption.points[6],
            y: shapeOption.points[7],
          },
          shapeOption
        ),
      });

      // Call callback function
      prop.onAppliedProp?.(shapeAPI, "apply-prop");
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

    // Get stage
    const getStage = React.useCallback((): Konva.Stage => {
      const node: Konva.Line = nodeRef.current;
      if (node) {
        return node.getStage();
      }
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

      applyProp();

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

    const handleMouseDown = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onMouseDown?.(shapeAPI);
    }, []);

    const handleMouseUp = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onMouseUp?.(shapeAPI);
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

          startNodeRef.current?.position(
            invertPoint(
              {
                x: shapeOption.points[0],
                y: shapeOption.points[1],
              },
              shapeOption
            )
          );

          control1NodeRef.current?.position(
            invertPoint(
              {
                x: shapeOption.points[2],
                y: shapeOption.points[3],
              },
              shapeOption
            )
          );

          control2NodeRef.current?.position(
            invertPoint(
              {
                x: shapeOption.points[4],
                y: shapeOption.points[5],
              },
              shapeOption
            )
          );

          endNodeRef.current?.position(
            invertPoint(
              {
                x: shapeOption.points[6],
                y: shapeOption.points[7],
              },
              shapeOption
            )
          );
        }

        // Call callback function
        currentPropRef.current.onDragMove?.(shapeAPI);
      },
      []
    );

    const handleControlDragMove = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Circle = e.target as Konva.Circle;
        if (node) {
          const shapeOption: KonvaShape = currentPropRef.current.shapeOption;
          const newPoint: Vector2d = invertPoint(node.position(), shapeOption);

          switch (node.id()) {
            default: {
              break;
            }

            case `${shapeOption.id}-start`: {
              shapeOption.points = [
                newPoint.x,
                newPoint.y,
                shapeOption.points[2],
                shapeOption.points[3],
                shapeOption.points[4],
                shapeOption.points[5],
                shapeOption.points[6],
                shapeOption.points[7],
              ];

              break;
            }

            case `${shapeOption.id}-control1`: {
              shapeOption.points = [
                shapeOption.points[0],
                shapeOption.points[1],
                newPoint.x,
                newPoint.y,
                shapeOption.points[4],
                shapeOption.points[5],
                shapeOption.points[6],
                shapeOption.points[7],
              ];

              break;
            }

            case `${shapeOption.id}-control2`: {
              shapeOption.points = [
                shapeOption.points[0],
                shapeOption.points[1],
                shapeOption.points[2],
                shapeOption.points[3],
                newPoint.x,
                newPoint.y,
                shapeOption.points[6],
                shapeOption.points[7],
              ];

              break;
            }

            case `${shapeOption.id}-end`: {
              shapeOption.points = [
                shapeOption.points[0],
                shapeOption.points[1],
                shapeOption.points[2],
                shapeOption.points[3],
                shapeOption.points[4],
                shapeOption.points[5],
                newPoint.x,
                newPoint.y,
              ];

              break;
            }
          }

          nodeRef.current?.points(shapeOption.points);
          lineNodeRef.current?.points(shapeOption.points);
        }
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

          startNodeRef.current?.position(
            transformPoint(
              {
                x: shapeOption.points[0],
                y: shapeOption.points[1],
              },
              shapeOption
            )
          );

          control1NodeRef.current?.position(
            transformPoint(
              {
                x: shapeOption.points[2],
                y: shapeOption.points[3],
              },
              shapeOption
            )
          );

          control2NodeRef.current?.position(
            transformPoint(
              {
                x: shapeOption.points[4],
                y: shapeOption.points[5],
              },
              shapeOption
            )
          );

          endNodeRef.current?.position(
            transformPoint(
              {
                x: shapeOption.points[6],
                y: shapeOption.points[7],
              },
              shapeOption
            )
          );
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
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          onDragMove={handleDragMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
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
          dash={[10, 10, 0, 10]}
        />

        <Circle
          id={`${prop.shapeOption.id}-start`}
          listening={true}
          ref={startNodeRef}
          draggable={true}
          radius={10}
          stroke={"#555555"}
          strokeWidth={1}
          fill={"#dddddd"}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          onDragMove={handleControlDragMove}
        />

        <Circle
          id={`${prop.shapeOption.id}-control1`}
          listening={true}
          ref={control1NodeRef}
          draggable={true}
          radius={10}
          stroke={"#555555"}
          strokeWidth={1}
          fill={"#dddddd"}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          onDragMove={handleControlDragMove}
        />

        <Circle
          id={`${prop.shapeOption.id}-control2`}
          listening={true}
          ref={control2NodeRef}
          draggable={true}
          radius={10}
          stroke={"#555555"}
          strokeWidth={1}
          fill={"#dddddd"}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          onDragMove={handleControlDragMove}
        />

        <Circle
          id={`${prop.shapeOption.id}-end`}
          listening={true}
          ref={endNodeRef}
          draggable={true}
          radius={10}
          stroke={"#555555"}
          strokeWidth={1}
          fill={"#dddddd"}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          onDragMove={handleControlDragMove}
        />
      </Portal>
    );
  }
);
