import { KonvaTooltipAPI, KonvaTooltipProp } from "./Types";
import { Label } from "react-konva";
import React from "react";
import Konva from "konva";

export const KonvaTooltip = React.memo(
  React.forwardRef<KonvaTooltipAPI, KonvaTooltipProp>(
    (prop, ref): React.JSX.Element => {
      const nodeRef = React.useRef<Konva.Label>(undefined);
      const currentPropRef = React.useRef<KonvaTooltipProp>(prop);

      // Update prop (Overwrite)
      React.useEffect(() => {
        Object.assign(currentPropRef.current, prop);

        applyProp();
      }, [prop]);

      // Apply prop
      const applyProp = React.useCallback((): void => {
        const node: Konva.Label = nodeRef.current;
        if (!node) {
          return;
        }

        // Clear old content
        node.destroyChildren();

        const prop: KonvaTooltipProp = currentPropRef.current;

        if (!prop.text) {
          return;
        }

        // Add tag
        node.add(
          new Konva.Tag({
            id: `${prop.id}-tag`,
            listening: false,
            draggable: false,
            cornerRadius: 4,
            fill: prop.backgroundColor,
            opacity: prop.backgroundOpacity,
          })
        );

        // Add text
        node.add(
          new Konva.Text({
            id: `${prop.id}-text`,
            listening: false,
            draggable: false,
            text: prop.text,
            fontSize: prop.fontSize,
            fill: prop.textColor,
            opacity: prop.textOpacity,
            padding: prop.padding,
          })
        );

        // Update node attrs
        node.setAttrs({
          x: prop.x,
          y: prop.y,
        });
      }, []);

      // Expose API
      React.useImperativeHandle(
        ref,
        (): KonvaTooltipAPI => ({
          updateProp: (prop?: KonvaTooltipProp): void => {
            if (prop) {
              currentPropRef.current = prop;
            }

            applyProp();
          },
          getNode: (): Konva.Label => nodeRef.current,
          getShape: (): KonvaTooltipProp => currentPropRef.current,
        }),
        []
      );

      return (
        <Label ref={nodeRef} listening={false} draggable={false} id={prop.id} />
      );
    }
  )
);
