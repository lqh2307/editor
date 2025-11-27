import { KonvaGridAPI, KonvaGridProp } from "./Types";
import { Group } from "react-konva";
import React from "react";
import Konva from "konva";

export const KonvaGrid = React.memo(
  React.forwardRef<KonvaGridAPI, KonvaGridProp>(
    (prop, ref): React.JSX.Element => {
      const nodeRef = React.useRef<Konva.Group>(undefined);
      const currentPropRef = React.useRef<KonvaGridProp>(prop);
      const dashRef = React.useRef<number[]>([2, 2]);

      // Update prop (Overwrite)
      React.useEffect(() => {
        currentPropRef.current = prop;

        applyProp();
      }, [prop]);

      // Apply prop
      const applyProp = React.useCallback((): void => {
        const node: Konva.Group = nodeRef.current;
        if (!node) {
          return;
        }

        // Clear old content
        node.destroyChildren();

        const prop: KonvaGridProp = currentPropRef.current;

        if (prop.style === "none") {
          node.clearCache();

          return;
        }

        const dash: number[] =
          prop.style === "dotted" ? dashRef.current : undefined;

        // Vertical lines
        const xCount: number = Math.floor(prop.width / prop.gap);

        for (let x = 0; x <= xCount; x++) {
          node.add(
            new Konva.Line({
              listening: false,
              draggable: false,
              id: `${prop.id}-vline-${x}`,
              points: [x * prop.gap, 0, x * prop.gap, prop.height],
              stroke: prop.stroke,
              opacity: x % 4 === 0 ? prop.opacity : prop.opacity * 0.5,
              strokeWidth: prop.strokeWidth,
              dash: dash,
            })
          );
        }

        // Horizontal lines
        const yCount: number = Math.floor(prop.height / prop.gap);

        for (let y = 0; y <= yCount; y++) {
          node.add(
            new Konva.Line({
              listening: false,
              draggable: false,
              id: `${prop.id}-hline-${y}`,
              points: [0, y * prop.gap, prop.width, y * prop.gap],
              stroke: prop.stroke,
              opacity: y % 4 === 0 ? prop.opacity : prop.opacity * 0.5,
              strokeWidth: prop.strokeWidth,
              dash: dash,
            })
          );
        }

        // Cache
        if (prop.width || prop.height) {
          node.cache();
        }
      }, []);

      // Expose API
      React.useImperativeHandle(
        ref,
        (): KonvaGridAPI => ({
          updateProp: (prop?: KonvaGridProp): void => {
            if (prop) {
              Object.assign(currentPropRef.current, prop);
            }

            applyProp();
          },
          getNode: (): Konva.Group => nodeRef.current,
          getShape: (): KonvaGridProp => currentPropRef.current,
        }),
        []
      );

      return (
        <Group ref={nodeRef} listening={false} draggable={false} id={prop.id} />
      );
    }
  )
);
