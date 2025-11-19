import { KonvaGuideLinesAPI, KonvaGuideLinesProp } from "./Types";
import { Group } from "react-konva";
import React from "react";
import Konva from "konva";

export const KonvaGuideLines = React.memo(
  React.forwardRef<KonvaGuideLinesAPI, KonvaGuideLinesProp>(
    (prop, ref): React.JSX.Element => {
      const nodeRef = React.useRef<Konva.Group>(undefined);
      const currentPropRef = React.useRef<KonvaGuideLinesProp>(prop);
      const dashRef = React.useRef<number[]>([4, 4]);

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

        const prop: KonvaGuideLinesProp = currentPropRef.current;

        if (prop.style === "none") {
          return;
        }

        const dash = prop.style === "dotted" ? dashRef.current : undefined;

        // Add horizontal lines
        prop.horizontalLines?.forEach((points, idx) => {
          node.add(
            new Konva.Line({
              listening: false,
              draggable: false,
              id: `${prop.id}-hline-${idx}`,
              points: points,
              stroke: prop.stroke,
              strokeWidth: prop.strokeWidth,
              opacity: prop.opacity,
              dash: dash,
            })
          );
        });

        // Add vertical lines
        prop.verticalLines?.forEach((points, idx) => {
          node.add(
            new Konva.Line({
              listening: false,
              draggable: false,
              id: `${prop.id}-vline-${idx}`,
              points: points,
              stroke: prop.stroke,
              strokeWidth: prop.strokeWidth,
              opacity: prop.opacity,
              dash: dash,
            })
          );
        });
      }, []);

      // Expose API
      React.useImperativeHandle(
        ref,
        (): KonvaGuideLinesAPI => ({
          updateProp: (prop?: KonvaGuideLinesProp): void => {
            if (prop) {
              Object.assign(currentPropRef.current, prop);
            }

            applyProp();
          },
          getNode: (): Konva.Group => nodeRef.current,
          getShape: (): KonvaGuideLinesProp => currentPropRef.current,
        }),
        []
      );

      return (
        <Group ref={nodeRef} listening={false} draggable={false} id={prop.id} />
      );
    }
  )
);
