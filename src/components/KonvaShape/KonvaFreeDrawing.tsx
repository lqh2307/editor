import { parseHexToRGBAString } from "../../utils/Color";
import { Portal } from "react-konva-utils";
import { Vector2d } from "konva/lib/types";
import { Group } from "react-konva";
import React from "react";
import Konva from "konva";
import {
  createTransform,
  createLineDash,
  createShapeBox,
  isHasTransform,
  resetTransform,
} from "../../utils/Shapes";
import {
  KonvaShapeProp,
  KonvaShapeAPI,
  RenderReason,
  KonvaShape,
} from "./Types";

export const KonvaFreeDrawing = React.memo(
  (prop: KonvaShapeProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Group>(undefined);
    const currentPropRef = React.useRef<KonvaShapeProp>(prop);
    const [isEnabled, setIsEnabled] = React.useState<boolean>(false);

    // Apply prop
    const applyProp = React.useCallback((reason?: RenderReason): void => {
      const prop: KonvaShapeProp = currentPropRef.current;
      const shapeOption: KonvaShape = prop.shapeOption;

      if (isHasTransform(shapeOption)) {
        const transform: Konva.Transform = createTransform(shapeOption);

        shapeOption.lines.forEach((line) => {
          line.points.forEach((_, idx, arr) => {
            if (idx % 2 !== 0) {
              return;
            }

            const newPoint: Vector2d = transform.point({
              x: arr[idx],
              y: arr[idx + 1],
            });

            arr[idx] = newPoint.x;
            arr[idx + 1] = newPoint.y;
          });
        });

        resetTransform(shapeOption);
      }

      const node: Konva.Group = nodeRef.current;
      if (node) {
        // Process attrs
        const fill: string = parseHexToRGBAString(
          shapeOption.fill as string,
          shapeOption.fillOpacity
        );

        const stroke: string = parseHexToRGBAString(
          shapeOption.stroke as string,
          shapeOption.strokeOpacity
        );

        const dash: number[] = createLineDash(shapeOption.lineStyle);

        // Add lines
        node.destroyChildren();

        shapeOption.lines.forEach((line) => {
          node.add(
            new Konva.Line({
              ...line,
              ...shapeOption,
              fill: fill,
              stroke: stroke,
              dash: dash,
              listening: true,
              draggable: false,
              key: line.id,
            })
          );
        });

        // Update node attrs
        node.setAttrs({
          ...shapeOption,
          draggable: shapeOption.draggable && prop.isSelected,
        });

        // Update shape box
        shapeOption.box = createShapeBox(node);
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
    const getNode = React.useCallback((): Konva.Group => {
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

    const handleDragStart = React.useCallback((): void => {
      setIsEnabled(true);
    }, []);

    const handleDragMove = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Group = e.target as Konva.Group;
        if (node) {
          Object.assign(currentPropRef.current.shapeOption, {
            x: node.x(),
            y: node.y(),
            box: createShapeBox(node),
          });
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

    const handleTransformEnd = React.useCallback(
      (e: Konva.KonvaEventObject<Event>): void => {
        const prop: KonvaShapeProp = currentPropRef.current;
        const shapeOption: KonvaShape = prop.shapeOption;

        const node: Konva.Group = e.target as Konva.Group;
        if (node) {
          const transform: Konva.Transform = node.getTransform().copy();

          Object.assign(shapeOption, transform.decompose());
        }

        // Call callback function
        prop.onAppliedProp?.(shapeAPI, "transform-end");
      },
      []
    );

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
        <Group
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
          onTransformEnd={handleTransformEnd}
        />
      </Portal>
    );
  }
);
