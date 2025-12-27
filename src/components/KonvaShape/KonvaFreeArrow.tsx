import { createLineDash, createShapeBox } from "../../utils/Shapes";
import { parseHexToRGBAString } from "../../utils/Color";
import { Portal } from "react-konva-utils";
import { Arrow, Circle, Group } from "react-konva";
import React from "react";
import Konva from "konva";
import {
  KonvaShapeProp,
  KonvaShapeAPI,
  RenderReason,
  KonvaShape,
} from "./Types";

export const KonvaFreeArrow = React.memo(
  (prop: KonvaShapeProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Group>(undefined);
    const currentPropRef = React.useRef<KonvaShapeProp>(prop);
    const [isEnabled, setIsEnabled] = React.useState<boolean>(false);

    // Apply prop
    const applyProp = React.useCallback((reason?: RenderReason): void => {
      const node: Konva.Group = nodeRef.current;
      if (node) {
        const prop: KonvaShapeProp = currentPropRef.current;
        const shapeOption: KonvaShape = prop.shapeOption;

        // Process node attrs
        const {
          id,
          x,
          y,
          scaleX,
          scaleY,
          skewX,
          skewY,
          rotation,
          lines,
          ...lineOption
        }: KonvaShape = shapeOption;

        lineOption.fill = parseHexToRGBAString(
          lineOption.fill as string,
          lineOption.fillOpacity
        );

        lineOption.stroke = parseHexToRGBAString(
          lineOption.stroke as string,
          lineOption.strokeOpacity
        );

        lineOption.dash = createLineDash(shapeOption.lineStyle);

        node.destroyChildren();

        // Add lines
        lines.forEach((line) => {
          node.add(
            new Konva.Line({
              ...line,
              ...lineOption,
              listening: true,
              draggable: false,
              key: line.id,
            })
          );
        });

        // Update node attrs
        node.setAttrs({
          ...shapeOption,
          id: id,
          x: x,
          y: y,
          scaleX: scaleX,
          scaleY: scaleY,
          skewX: skewX,
          skewY: skewY,
          rotation: rotation,
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
        const node: Konva.Group = e.target as Konva.Group;
        if (node) {
          const shapeOption: KonvaShape = currentPropRef.current.shapeOption;

          const transform = node.getTransform().copy();

          shapeOption.lines.forEach((line) => {
            const newPoints: number[] = [];

            for (let i = 0; i < line.points.length; i += 2) {
              const p = transform.point({
                x: line.points[i],
                y: line.points[i + 1],
              });

              newPoints.push(p.x, p.y);
            }

            line.points = newPoints;
          });

          Object.assign(shapeOption, {
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            skewX: 0,
            skewY: 0,
            x: 0,
            y: 0,
          });
        }

        // Call callback function
        currentPropRef.current.onAppliedProp?.(shapeAPI, "transform-end");
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
        >
          <Arrow
            ref={headRef}
            points={undefined}
            stroke="black"
            strokeWidth={10}
          />

          <Arrow
            ref={leftTailRef}
            points={undefined}
            stroke="black"
            strokeWidth={10}
            tension={0.45}
          />

          <Arrow
            ref={rightTailRef}
            points={undefined}
            stroke="black"
            strokeWidth={10}
            tension={0.45}
          />
        </Group>

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

// /* ================= ARROW STRUCT ================= */

// const ARROW_DEF = {
//   head: [0, 1, 2, 3, 4],
//   leftTail: [0, 5, 6],
//   rightTail: [4, 7, 8],
// };

// export default function App() {
//   const groupRef = useRef();
//   const trRef = useRef();

//   const headRef = useRef();
//   const leftTailRef = useRef();
//   const rightTailRef = useRef();

//   const controlRefs = useRef({});

//   /* ===== SOURCE OF TRUTH ===== */
//   const shape = useRef({
//     points: [
//       84, 77, 38, 100, 101, 0, 161, 100, 115, 77,

//       84, 123, 50, 200,

//       115, 123, 150, 200,
//     ],
//   });

//   /* ================= RENDER ================= */

//   const renderArrow = () => {
//     const pts = shape.current.points;
//     headRef.current.points(pickPoints(pts, ARROW_DEF.head));
//     leftTailRef.current.points(pickPoints(pts, ARROW_DEF.leftTail));
//     rightTailRef.current.points(pickPoints(pts, ARROW_DEF.rightTail));
//   };

//   const updateControlsIdentity = () => {
//     const pts = shape.current.points;
//     for (let i = 0; i < pts.length; i += 2) {
//       controlRefs.current[i]?.position({
//         x: pts[i],
//         y: pts[i + 1],
//       });
//     }
//   };

//   /* ===== PREVIEW TRANSFORM ===== */

//   const updateControlPreview = () => {
//     const group = groupRef.current;
//     const tr = group.getAbsoluteTransform().copy();

//     const pts = shape.current.points;
//     for (let i = 0; i < pts.length; i += 2) {
//       const c = controlRefs.current[i];
//       if (!c) continue;

//       const p = tr.point({ x: pts[i], y: pts[i + 1] });
//       c.position(p);
//     }
//   };

//   /* ===== CONTROL DRAG ===== */

//   const onControlDragMove = (e) => {
//     const idx = Number(e.target.id());
//     shape.current.points[idx] = e.target.x();
//     shape.current.points[idx + 1] = e.target.y();

//     renderArrow();
//   };

//   /* ===== TRANSFORM BAKE ===== */

//   const bakeTransform = () => {
//     const group = groupRef.current;
//     const tr = group.getAbsoluteTransform().copy();

//     const pts = shape.current.points;
//     for (let i = 0; i < pts.length; i += 2) {
//       const p = tr.point({ x: pts[i], y: pts[i + 1] });
//       pts[i] = p.x;
//       pts[i + 1] = p.y;
//     }

//     // reset group
//     group.position({ x: 0, y: 0 });
//     group.scale({ x: 1, y: 1 });
//     group.rotation(0);

//     renderArrow();
//     updateControlsIdentity();

//     // 🔥 refresh transformer AFTER render
//     requestAnimationFrame(() => {
//       trRef.current.nodes([group]);
//       trRef.current.getLayer().batchDraw();
//     });
//   };

//   /* ================= INIT ================= */

//   useEffect(() => {
//     renderArrow();
//     updateControlsIdentity();

//     trRef.current.nodes([groupRef.current]);
//     trRef.current.getLayer().batchDraw();
//   }, []);

//   return (
//     <Stage width={window.innerWidth} height={window.innerHeight}>
//       <Layer>
//         {/* ===== ARROW ===== */}
//         <Group
//           ref={groupRef}
//           draggable
//           onDragMove={updateControlPreview}
//           onTransform={updateControlPreview}
//           onDragEnd={bakeTransform}
//           onTransformEnd={bakeTransform}
//         >
//           <Line ref={headRef} stroke="black" strokeWidth={10} />
//           <Line
//             ref={leftTailRef}
//             stroke="black"
//             strokeWidth={10}
//             tension={0.45}
//           />
//           <Line
//             ref={rightTailRef}
//             stroke="black"
//             strokeWidth={10}
//             tension={0.45}
//           />
//         </Group>

//         {/* ===== CONTROLS ===== */}
//         {shape.current.points.map((_, idx) =>
//           idx % 2 === 0 ? (
//             <Circle
//               key={idx}
//               id={String(idx)}
//               ref={(n) => (controlRefs.current[idx] = n)}
//               radius={6}
//               fill="white"
//               stroke="black"
//               draggable
//               onDragMove={onControlDragMove}
//             />
//           ) : null
//         )}

//         <Transformer ref={trRef} />
//       </Layer>
//     </Stage>
//   );
// }
