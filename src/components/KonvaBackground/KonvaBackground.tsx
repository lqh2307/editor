import { KonvaBackgroundAPI, KonvaBackgroundProp } from "./Types";
import { Rect } from "react-konva";
import React from "react";
import Konva from "konva";

export const KonvaBackground = React.memo(
  React.forwardRef<KonvaBackgroundAPI, KonvaBackgroundProp>(
    (prop, ref): React.JSX.Element => {
      const nodeRef = React.useRef<Konva.Rect>(undefined);
      const currentPropRef = React.useRef<KonvaBackgroundProp>(prop);

      // Update prop (Overwrite)
      React.useEffect(() => {
        currentPropRef.current = prop;

        applyProp();
      }, [prop]);

      // Apply prop
      const applyProp = React.useCallback((): void => {
        const node: Konva.Rect = nodeRef.current;
        if (!node) {
          return;
        }

        const prop: KonvaBackgroundProp = currentPropRef.current;

        if (!prop.width && !prop.height) {
          node.clearCache();

          return;
        } else {
          // Update node attrs
          node.setAttrs(prop);

          // Cache
          node.cache();
        }
      }, []);

      // Expose API
      React.useImperativeHandle(
        ref,
        (): KonvaBackgroundAPI => ({
          updateProp: (prop?: KonvaBackgroundProp): void => {
            if (prop) {
              Object.assign(currentPropRef.current, prop);
            }

            applyProp();
          },
          getNode: (): Konva.Rect => nodeRef.current,
          getShape: (): KonvaBackgroundProp => currentPropRef.current,
        }),
        []
      );

      return (
        <Rect ref={nodeRef} listening={false} draggable={false} id={prop.id} />
      );
    }
  )
);
