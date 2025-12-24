import { parseHexToRGBAString } from "../../utils/Color";
import { Arrow, Circle } from "react-konva";
import { Portal } from "react-konva-utils";
import { Vector2d } from "konva/lib/types";
import Konva from "konva";
import React from "react";
import {
  createLineDash,
  createShapeBox,
  transformPoint,
  invertPoint,
} from "../../utils/Shapes";
import {
  KonvaShapeProp,
  KonvaShapeAPI,
  RenderReason,
  KonvaShape,
} from "./Types";

export const KonvaArrow = React.memo(
  (prop: KonvaShapeProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Arrow>(undefined);
    const currentPropRef = React.useRef<KonvaShapeProp>(prop);
    const [isEnabled, setIsEnabled] = React.useState<boolean>(false);

    // Store control
    const controlNodeRef = React.useRef<Record<string, Konva.Circle>>({});
    const midControlNodeRef = React.useRef<Record<string, Konva.Circle>>({});
    const sizeControlNodeRef = React.useRef<Record<string, Konva.Circle>>({});

    // Update all anchors positions (points, midpoints, size handles)
    const updateAllAnchors = React.useCallback((): void => {
      const prop: KonvaShapeProp = currentPropRef.current;
      const shapeOption: KonvaShape = prop.shapeOption;
      if (!shapeOption?.points?.length) return;

      // Control (vertex) anchors
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

      // Midpoint anchors
      for (let idx = 0; idx < shapeOption.points.length - 2; idx += 2) {
        const midId = `${shapeOption.id}-mid-${idx}`;
        const x1 = shapeOption.points[idx];
        const y1 = shapeOption.points[idx + 1];
        const x2 = shapeOption.points[idx + 2];
        const y2 = shapeOption.points[idx + 3];
        const mid = transformPoint(
          { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
          shapeOption
        );
        midControlNodeRef.current[midId]?.setAttrs({
          visible: prop.isEditted,
          x: mid.x,
          y: mid.y,
        });
      }

      // Arrow head size handles (length/width)
      if (shapeOption.points.length >= 4) {
        const idBase = shapeOption.id;
        const endIdx = shapeOption.points.length - 2;
        const prevIdx = shapeOption.points.length - 4;
        const endLocal = {
          x: shapeOption.points[endIdx],
          y: shapeOption.points[endIdx + 1],
        };
        const prevLocal = {
          x: shapeOption.points[prevIdx],
          y: shapeOption.points[prevIdx + 1],
        };
        const vx = endLocal.x - prevLocal.x;
        const vy = endLocal.y - prevLocal.y;
        const vlen = Math.hypot(vx, vy) || 1;
        const ux = vx / vlen;
        const uy = vy / vlen;
        const nx = -uy;
        const ny = ux;

        const baseLocal = {
          x: endLocal.x - ux * (shapeOption.pointerLength ?? 10),
          y: endLocal.y - uy * (shapeOption.pointerLength ?? 10),
        };
        const widthHandleLocal = {
          x: baseLocal.x + nx * ((shapeOption.pointerWidth ?? 10) / 2),
          y: baseLocal.y + ny * ((shapeOption.pointerWidth ?? 10) / 2),
        };
        const baseWorld = transformPoint(baseLocal, shapeOption);
        const widthWorld = transformPoint(widthHandleLocal, shapeOption);

        sizeControlNodeRef.current[`${idBase}-len`]?.setAttrs({
          visible: prop.isEditted,
          x: baseWorld.x,
          y: baseWorld.y,
        });
        sizeControlNodeRef.current[`${idBase}-wid`]?.setAttrs({
          visible: prop.isEditted,
          x: widthWorld.x,
          y: widthWorld.y,
        });

        // Tail width handle (strokeWidth)
        const startIdx = 0;
        const nextIdx = 2;
        const startLocal = {
          x: shapeOption.points[startIdx],
          y: shapeOption.points[startIdx + 1],
        };
        const nextLocal = {
          x: shapeOption.points[nextIdx],
          y: shapeOption.points[nextIdx + 1],
        };
        const tvx = nextLocal.x - startLocal.x;
        const tvy = nextLocal.y - startLocal.y;
        const tvlen = Math.hypot(tvx, tvy) || 1;
        const tux = tvx / tvlen;
        const tuy = tvy / tvlen;
        const tnx = -tuy;
        const tny = tux;
        const tailWidthLocal = {
          x: startLocal.x + tnx * ((shapeOption.strokeWidth ?? 10) / 2),
          y: startLocal.y + tny * ((shapeOption.strokeWidth ?? 10) / 2),
        };
        const tailWidthWorld = transformPoint(tailWidthLocal, shapeOption);
        sizeControlNodeRef.current[`${idBase}-twid`]?.setAttrs({
          visible: prop.isEditted,
          x: tailWidthWorld.x,
          y: tailWidthWorld.y,
        });
      }
    }, []);

    // Apply prop
    const applyProp = React.useCallback((reason?: RenderReason): void => {
      const prop: KonvaShapeProp = currentPropRef.current;
      const shapeOption: KonvaShape = prop.shapeOption;

      const node: Konva.Arrow = nodeRef.current;
      if (node) {
        // Update node attrs
        node.setAttrs({
          ...shapeOption,
          draggable: shapeOption.draggable && prop.isSelected,
          fill: parseHexToRGBAString(
            shapeOption.fill as string,
            shapeOption.fillOpacity
          ),
          stroke: parseHexToRGBAString(
            shapeOption.stroke as string,
            shapeOption.strokeOpacity
          ),
          dash: createLineDash(shapeOption.lineStyle),
        } as Konva.ArrowConfig);

        // Update shape box
        shapeOption.box = createShapeBox(node);
      }

      // Update controll attrs
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

      // Update mid-control attrs (insert anchors between segments)
      for (let idx = 0; idx < shapeOption.points.length - 2; idx += 2) {
        const midId = `${shapeOption.id}-mid-${idx}`;

        const x1 = shapeOption.points[idx];
        const y1 = shapeOption.points[idx + 1];
        const x2 = shapeOption.points[idx + 2];
        const y2 = shapeOption.points[idx + 3];

        const mid = transformPoint(
          {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2,
          },
          shapeOption
        );

        midControlNodeRef.current[midId]?.setAttrs({
          visible: prop.isEditted,
          x: mid.x,
          y: mid.y,
        });
      }

      // Update size-control attrs (arrow head length & width)
      if (shapeOption.points?.length >= 4) {
        const idBase = shapeOption.id;
        const endIdx = shapeOption.points.length - 2;
        const prevIdx = shapeOption.points.length - 4;

        const endLocal = {
          x: shapeOption.points[endIdx],
          y: shapeOption.points[endIdx + 1],
        };
        const prevLocal = {
          x: shapeOption.points[prevIdx],
          y: shapeOption.points[prevIdx + 1],
        };

        const vx = endLocal.x - prevLocal.x;
        const vy = endLocal.y - prevLocal.y;
        const vlen = Math.hypot(vx, vy) || 1;
        const ux = vx / vlen;
        const uy = vy / vlen;
        const nx = -uy;
        const ny = ux;

        const baseLocal = {
          x: endLocal.x - ux * (shapeOption.pointerLength ?? 10),
          y: endLocal.y - uy * (shapeOption.pointerLength ?? 10),
        };

        const widthHandleLocal = {
          x: baseLocal.x + nx * ((shapeOption.pointerWidth ?? 10) / 2),
          y: baseLocal.y + ny * ((shapeOption.pointerWidth ?? 10) / 2),
        };

        const baseWorld = transformPoint(baseLocal, shapeOption);
        const widthWorld = transformPoint(widthHandleLocal, shapeOption);

        sizeControlNodeRef.current[`${idBase}-len`]?.setAttrs({
          visible: prop.isEditted,
          x: baseWorld.x,
          y: baseWorld.y,
        });
        sizeControlNodeRef.current[`${idBase}-wid`]?.setAttrs({
          visible: prop.isEditted,
          x: widthWorld.x,
          y: widthWorld.y,
        });
      }

      // Update tail width control (adjust strokeWidth)
      if (shapeOption.points?.length >= 4) {
        const idBase = shapeOption.id;
        const startIdx = 0;
        const nextIdx = 2;

        const startLocal = {
          x: shapeOption.points[startIdx],
          y: shapeOption.points[startIdx + 1],
        };
        const nextLocal = {
          x: shapeOption.points[nextIdx],
          y: shapeOption.points[nextIdx + 1],
        };

        const tvx = nextLocal.x - startLocal.x;
        const tvy = nextLocal.y - startLocal.y;
        const tvlen = Math.hypot(tvx, tvy) || 1;
        const tux = tvx / tvlen;
        const tuy = tvy / tvlen;
        const tnx = -tuy;
        const tny = tux;

        const tailWidthLocal = {
          x: startLocal.x + tnx * ((shapeOption.strokeWidth ?? 10) / 2),
          y: startLocal.y + tny * ((shapeOption.strokeWidth ?? 10) / 2),
        };

        const tailWidthWorld = transformPoint(tailWidthLocal, shapeOption);

        sizeControlNodeRef.current[`${idBase}-twid`]?.setAttrs({
          visible: prop.isEditted,
          x: tailWidthWorld.x,
          y: tailWidthWorld.y,
        });
      }

      // Also sync other anchors
      updateAllAnchors();

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
    const getNode = React.useCallback((): Konva.Arrow => {
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

            shapeOption.points[idx] = newPoint.x;
            shapeOption.points[idx + 1] = newPoint.y;

            nodeRef.current?.points(shapeOption.points);
          }
        }
        // Sync mid/size anchors while dragging a point
        updateAllAnchors();
      },
      []
    );

    const handleControlDragEnd = React.useCallback((): void => {
      setIsEnabled(false);

      // Call callback function
      applyProp("control-drag-end");
    }, []);

    const handleControlDblClick = React.useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>): void => {
        const node: Konva.Circle = e.target as Konva.Circle;
        const shapeOption: KonvaShape = currentPropRef.current.shapeOption;
        if (!node || !shapeOption) return;

        const id: string = node.id();
        // Format: `${shapeOption.id}-${idx}`
        const idx: number = Number(id.slice(id.lastIndexOf("-") + 1));
        // Keep at least two points (4 numbers)
        if (Number.isFinite(idx) && shapeOption.points.length > 4) {
          shapeOption.points.splice(idx, 2);
          delete controlNodeRef.current[id];
          node.destroy();
          applyProp("commit");
        }
      },
      []
    );

    const handleDragStart = React.useCallback((): void => {
      setIsEnabled(true);
    }, []);

    const handleDragMove = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Arrow = e.target as Konva.Arrow;
        if (node) {
          const shapeOption: KonvaShape = currentPropRef.current.shapeOption;
          const newPosition: Vector2d = node.position();

          Object.assign(shapeOption, {
            x: newPosition.x,
            y: newPosition.y,
            box: createShapeBox(node),
          });

          updateAllAnchors();
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
        const node: Konva.Arrow = e.target as Konva.Arrow;
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

          updateAllAnchors();
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

    // Mid-control handlers (for inserting new points like draw.io)
    const handleMidControlDragStart = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        setIsEnabled(true);

        const node: Konva.Circle = e.target as Konva.Circle;
        const id = node.id(); // `${shapeOption.id}-mid-${idx}`
        const shapeOption: KonvaShape = currentPropRef.current.shapeOption;
        if (!id.includes("-mid-")) return;

        const base = id.slice(0, id.lastIndexOf("-mid-"));
        const startIdx = Number(id.slice(id.lastIndexOf("-mid-") + 5));
        if (!Number.isFinite(startIdx)) return;

        const insertedIdx = startIdx + 2;

        const newLocalPoint = invertPoint(node.position(), shapeOption);
        shapeOption.points.splice(insertedIdx, 0, newLocalPoint.x, newLocalPoint.y);

        // Convert this mid node into a real control node by changing its id
        const newId = `${base}-${insertedIdx}`;
        node.id(newId);
        controlNodeRef.current[newId] = node;
        delete midControlNodeRef.current[id];

        nodeRef.current?.points(shapeOption.points);
      },
      []
    );

    const handleMidControlDragMove = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Circle = e.target as Konva.Circle;
        if (!node) return;
        const id = node.id();
        const shapeOption: KonvaShape = currentPropRef.current.shapeOption;

        let idx: number;
        if (id.includes("-mid-")) {
          const startIdx = Number(id.slice(id.lastIndexOf("-mid-") + 5));
          if (!Number.isFinite(startIdx)) return;
          idx = startIdx + 2;
        } else {
          idx = Number(id.slice(id.lastIndexOf("-") + 1));
        }

        const newPoint = invertPoint(node.position(), shapeOption);
        shapeOption.points[idx] = newPoint.x;
        shapeOption.points[idx + 1] = newPoint.y;
        nodeRef.current?.points(shapeOption.points);
      },
      []
    );

    const handleMidControlDragEnd = React.useCallback((): void => {
      setIsEnabled(false);
      applyProp("control-drag-end");
    }, []);

    // Arrow head size handlers
    const handleSizeControlDragStart = React.useCallback((): void => {
      setIsEnabled(true);
    }, []);

    const handleLenControlDragMove = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Circle = e.target as Konva.Circle;
        const shapeOption: KonvaShape = currentPropRef.current.shapeOption;
        if (!node || !shapeOption?.points || shapeOption.points.length < 4)
          return;

        const endIdx = shapeOption.points.length - 2;
        const prevIdx = shapeOption.points.length - 4;
        const endLocal = {
          x: shapeOption.points[endIdx],
          y: shapeOption.points[endIdx + 1],
        };
        const prevLocal = {
          x: shapeOption.points[prevIdx],
          y: shapeOption.points[prevIdx + 1],
        };

        const vx = endLocal.x - prevLocal.x;
        const vy = endLocal.y - prevLocal.y;
        const vlen = Math.hypot(vx, vy) || 1;
        const ux = vx / vlen;
        const uy = vy / vlen;

        // Convert dragged world position to local
        const posLocal = invertPoint(node.position(), shapeOption);

        const dx = endLocal.x - posLocal.x;
        const dy = endLocal.y - posLocal.y;
        const proj = dx * ux + dy * uy; // along the direction towards base
        // Clamp pointer length to segment length
        shapeOption.pointerLength = Math.max(0, Math.min(proj, vlen));

        nodeRef.current?.pointerLength(shapeOption.pointerLength as number);
        updateAllAnchors();
        applyProp();
      },
      []
    );

    const handleWidthControlDragMove = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Circle = e.target as Konva.Circle;
        const shapeOption: KonvaShape = currentPropRef.current.shapeOption;
        if (!node || !shapeOption?.points || shapeOption.points.length < 4)
          return;

        const endIdx = shapeOption.points.length - 2;
        const prevIdx = shapeOption.points.length - 4;
        const endLocal = {
          x: shapeOption.points[endIdx],
          y: shapeOption.points[endIdx + 1],
        };
        const prevLocal = {
          x: shapeOption.points[prevIdx],
          y: shapeOption.points[prevIdx + 1],
        };

        const vx = endLocal.x - prevLocal.x;
        const vy = endLocal.y - prevLocal.y;
        const vlen = Math.hypot(vx, vy) || 1;
        const ux = vx / vlen;
        const uy = vy / vlen;
        const nx = -uy;
        const ny = ux;

        const posLocal = invertPoint(node.position(), shapeOption);

        const baseLocal = {
          x: endLocal.x - ux * (shapeOption.pointerLength ?? 10),
          y: endLocal.y - uy * (shapeOption.pointerLength ?? 10),
        };

        const dx = posLocal.x - baseLocal.x;
        const dy = posLocal.y - baseLocal.y;
        const side = dx * nx + dy * ny; // signed distance along normal
        shapeOption.pointerWidth = Math.max(0, Math.abs(side) * 2);

        nodeRef.current?.pointerWidth(shapeOption.pointerWidth as number);
        updateAllAnchors();
        applyProp();
      },
      []
    );

    const handleSizeControlDragEnd = React.useCallback((): void => {
      setIsEnabled(false);
      applyProp("control-drag-end");
    }, []);

    const handleTailWidthControlDragMove = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Circle = e.target as Konva.Circle;
        const shapeOption: KonvaShape = currentPropRef.current.shapeOption;
        if (!node || !shapeOption?.points || shapeOption.points.length < 4)
          return;

        const startIdx = 0;
        const nextIdx = 2;
        const startLocal = {
          x: shapeOption.points[startIdx],
          y: shapeOption.points[startIdx + 1],
        };
        const nextLocal = {
          x: shapeOption.points[nextIdx],
          y: shapeOption.points[nextIdx + 1],
        };

        const tvx = nextLocal.x - startLocal.x;
        const tvy = nextLocal.y - startLocal.y;
        const tvlen = Math.hypot(tvx, tvy) || 1;
        const tux = tvx / tvlen;
        const tuy = tvy / tvlen;
        const tnx = -tuy;
        const tny = tux;

        const posLocal = invertPoint(node.position(), shapeOption);

        const dx = posLocal.x - startLocal.x;
        const dy = posLocal.y - startLocal.y;
        const side = dx * tnx + dy * tny;
        const newStrokeWidth = Math.max(1, Math.abs(side) * 2);
        shapeOption.strokeWidth = newStrokeWidth;

        nodeRef.current?.strokeWidth(newStrokeWidth as number);
        updateAllAnchors();
        applyProp();
      },
      []
    );

    return (
      <Portal selector={"#shapes"} enabled={isEnabled}>
        <Arrow
          listening={true}
          ref={nodeRef}
          points={undefined}
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

        {prop.shapeOption.points.map((_, idx) => {
          if (idx % 2 === 0) {
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
                onDblClick={handleControlDblClick}
                onDragStart={handleControlDragStart}
                onDragMove={handleControlDragMove}
                onDragEnd={handleControlDragEnd}
              />
            );
          } else {
            return;
          }
        })}

        {/* Midpoint anchors to insert new points */}
        {prop.shapeOption.points.length >= 4 &&
          prop.shapeOption.points.map((_, idx) => {
            if (idx % 2 === 0 && idx < prop.shapeOption.points.length - 2) {
              const midId: string = `${prop.shapeOption.id}-mid-${idx}`;

              return (
                <Circle
                  id={midId}
                  key={midId}
                  listening={true}
                  ref={(node: Konva.Circle): void => {
                    if (node) {
                      if (!midControlNodeRef.current[midId]) {
                        midControlNodeRef.current[midId] = node;
                      }
                    } else {
                      delete midControlNodeRef.current[midId];
                    }
                  }}
                  draggable={true}
                  radius={7}
                  stroke={"#1976d2"}
                  strokeWidth={1}
                  fill={"#e3f2fd"}
                  onMouseOver={handleMouseOver}
                  onMouseLeave={handleMouseLeave}
                  onDragStart={handleMidControlDragStart}
                  onDragMove={handleMidControlDragMove}
                  onDragEnd={handleMidControlDragEnd}
                />
              );
            } else {
              return;
            }
          })}

        {/* Arrow head size anchors: length and width */}
        {prop.shapeOption.points.length >= 4 && (
          <>
            <Circle
              id={`${prop.shapeOption.id}-len`}
              key={`${prop.shapeOption.id}-len`}
              listening={true}
              ref={(node: Konva.Circle): void => {
                const id = `${prop.shapeOption.id}-len`;
                if (node) {
                  if (!sizeControlNodeRef.current[id]) {
                    sizeControlNodeRef.current[id] = node;
                  }
                } else {
                  delete sizeControlNodeRef.current[id];
                }
              }}
              draggable={true}
              radius={8}
              stroke={"#2e7d32"}
              strokeWidth={1}
              fill={"#e8f5e9"}
              onMouseOver={handleMouseOver}
              onMouseLeave={handleMouseLeave}
              onDragStart={handleSizeControlDragStart}
              onDragMove={handleLenControlDragMove}
              onDragEnd={handleSizeControlDragEnd}
            />
            <Circle
              id={`${prop.shapeOption.id}-wid`}
              key={`${prop.shapeOption.id}-wid`}
              listening={true}
              ref={(node: Konva.Circle): void => {
                const id = `${prop.shapeOption.id}-wid`;
                if (node) {
                  if (!sizeControlNodeRef.current[id]) {
                    sizeControlNodeRef.current[id] = node;
                  }
                } else {
                  delete sizeControlNodeRef.current[id];
                }
              }}
              draggable={true}
              radius={8}
              stroke={"#ef6c00"}
              strokeWidth={1}
              fill={"#fff3e0"}
              onMouseOver={handleMouseOver}
              onMouseLeave={handleMouseLeave}
              onDragStart={handleSizeControlDragStart}
              onDragMove={handleWidthControlDragMove}
              onDragEnd={handleSizeControlDragEnd}
            />
            <Circle
              id={`${prop.shapeOption.id}-twid`}
              key={`${prop.shapeOption.id}-twid`}
              listening={true}
              ref={(node: Konva.Circle): void => {
                const id = `${prop.shapeOption.id}-twid`;
                if (node) {
                  if (!sizeControlNodeRef.current[id]) {
                    sizeControlNodeRef.current[id] = node;
                  }
                } else {
                  delete sizeControlNodeRef.current[id];
                }
              }}
              draggable={true}
              radius={8}
              stroke={"#6a1b9a"}
              strokeWidth={1}
              fill={"#f3e5f5"}
              onMouseOver={handleMouseOver}
              onMouseLeave={handleMouseLeave}
              onDragStart={handleSizeControlDragStart}
              onDragMove={handleTailWidthControlDragMove}
              onDragEnd={handleSizeControlDragEnd}
            />
          </>
        )}
      </Portal>
    );
  }
);
