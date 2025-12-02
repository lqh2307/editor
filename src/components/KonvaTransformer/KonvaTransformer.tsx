import { KonvaTransformerProp, KonvaTransformerAPI } from "./Types";
import { Transformer } from "react-konva";
import Konva from "konva";
import React from "react";

export const KonvaTransformer = React.memo(
  React.forwardRef<KonvaTransformerAPI, KonvaTransformerProp>(
    (prop, ref): React.JSX.Element => {
      const nodeRef = React.useRef<Konva.Transformer>(undefined);
      const currentPropRef = React.useRef<KonvaTransformerProp>(prop);

      // Apply prop
      const applyProp = React.useCallback((): void => {
        const node: Konva.Transformer = nodeRef.current;
        if (!node) {
          return;
        }

        // Update node attrs
        node.setAttrs(currentPropRef.current);
      }, []);

      // Update prop
      const updateProp = React.useCallback(
        (prop?: KonvaTransformerProp): void => {
          if (prop) {
            Object.assign(currentPropRef.current, prop);
          }

          applyProp();
        },
        []
      );

      // Get stage
      const getStage = React.useCallback((): Konva.Stage => {
        const node: Konva.Transformer = nodeRef.current;
        if (node) {
          return node.getStage();
        }
      }, []);

      // Get node
      const getNode = React.useCallback((): Konva.Transformer => {
        return nodeRef.current;
      }, []);

      // Get prop
      const getShape = React.useCallback((): KonvaTransformerProp => {
        return currentPropRef.current;
      }, []);

      // Shape API
      const shapeAPI: KonvaTransformerAPI = React.useMemo(
        () => ({
          updateProp,
          getStage,
          getNode,
          getShape,
        }),
        []
      );

      // Update prop
      React.useEffect(() => {
        currentPropRef.current = prop;

        applyProp();
      }, [prop]);

      // Expose API
      React.useImperativeHandle(ref, (): KonvaTransformerAPI => shapeAPI, []);

      const handleDragStart = React.useCallback((): void => {
        // Call callback function
        currentPropRef.current.onDragStart?.(shapeAPI);
      }, []);

      const handleDragEnd = React.useCallback((): void => {
        // Call callback function
        currentPropRef.current.onDragEnd?.(shapeAPI);
      }, []);

      return (
        <Transformer
          listening={true}
          draggable={false}
          ref={nodeRef}
          id={prop.id}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      );
    }
  )
);
