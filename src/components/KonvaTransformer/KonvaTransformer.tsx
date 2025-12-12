import { KonvaTransformerProp, KonvaTransformerAPI, KonvaTFM } from "./Types";
import { Transformer } from "react-konva";
import Konva from "konva";
import React from "react";

export const KonvaTransformer = React.memo(
  (prop: KonvaTransformerProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Transformer>(undefined);
    const currentPropRef = React.useRef<KonvaTransformerProp>(prop);

    const defaultOptionRef = React.useRef<KonvaTFM>({
      listening: true,
      draggable: true,
      keepRatio: true,
      rotationSnaps: [
        -180, -165, -150, -135, -120, -105, -90, -75, -60, -45, -30, -15, 0, 15,
        30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180,
      ],
      rotationSnapTolerance: 3,
      ignoreStroke: false,
      flipEnabled: true,
      enabledAnchors: [
        "top-left",
        "top-center",
        "top-right",
        "middle-right",
        "middle-left",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
      nodes: [],
    });

    // Apply prop
    const applyProp = React.useCallback((): void => {
      const node: Konva.Transformer = nodeRef.current;
      if (node) {
        // Update node attrs
        node.setAttrs(currentPropRef.current.transformerOption);
      }
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

    // Update transformer
    const updateTransformer = React.useCallback(
      (transformer?: KonvaTFM): void => {
        if (transformer) {
          Object.assign(currentPropRef.current.transformerOption, transformer);
        }

        applyProp();
      },
      []
    );

    // Get stage
    const getStage = React.useCallback((): Konva.Stage => {
      return nodeRef.current?.getStage();
    }, []);

    // Get node
    const getNode = React.useCallback((): Konva.Transformer => {
      return nodeRef.current;
    }, []);

    // Get transformer
    const getTransformer = React.useCallback((): KonvaTFM => {
      return currentPropRef.current.transformerOption;
    }, []);

    // Transformer API
    const transformerAPI: KonvaTransformerAPI = React.useMemo(
      () => ({
        updateProp,
        updateTransformer,
        getStage,
        getNode,
        getTransformer,
      }),
      []
    );

    // Update shape
    React.useEffect(() => {
      currentPropRef.current = prop;

      applyProp();

      // Call callback function
      prop.onMounted?.(prop.transformerOption.id, transformerAPI);

      return () => {
        // Call callback function
        prop.onUnMounted?.(prop.transformerOption.id);
      };
    }, [prop]);

    return <Transformer ref={nodeRef} {...defaultOptionRef.current} />;
  }
);
