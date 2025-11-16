import { KonvaTransformerProp, KonvaTransformerAPI } from "./Types";
import { Transformer } from "react-konva";
import Konva from "konva";
import React from "react";

export const KonvaTransformer = React.memo(
  React.forwardRef<KonvaTransformerAPI, KonvaTransformerProp>(
    (prop, ref): React.JSX.Element => {
      const nodeRef = React.useRef<Konva.Transformer>(undefined);
      const currentPropRef = React.useRef<KonvaTransformerProp>(prop);

      // Update prop (Overwrite)
      React.useEffect(() => {
        currentPropRef.current = prop;

        applyProp();
      }, [prop]);

      // Apply prop
      const applyProp = React.useCallback((): void => {
        const node: Konva.Transformer = nodeRef.current;
        if (!node) {
          return;
        }

        // Update node attrs
        node.setAttrs(currentPropRef.current);
      }, []);

      // Expose API
      React.useImperativeHandle(
        ref,
        (): KonvaTransformerAPI => ({
          updateProp: (prop?: KonvaTransformerProp): void => {
            if (prop) {
              Object.assign(currentPropRef.current, prop);
            }

            applyProp();
          },
          getNode: (): Konva.Transformer => nodeRef.current,
          getShape: (): KonvaTransformerProp => currentPropRef.current,
        }),
        []
      );

      const handleTransformStart = React.useCallback(
        (e: Konva.KonvaEventObject<Event>): void => {
          const node: Konva.Transformer = e.currentTarget as Konva.Transformer;
          if (!node) {
            return;
          }

          (node as any).lastActiveAnchor = node.getActiveAnchor();
        },
        []
      );

      return (
        <Transformer
          listening={true}
          draggable={false}
          ref={nodeRef}
          id={prop.id}
          onTransformStart={handleTransformStart}
        />
      );
    }
  )
);
