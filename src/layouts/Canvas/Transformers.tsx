import { useShapesContext } from "../../contexts";
import React from "react";
import {
  KonvaTransformerAPI,
  KonvaTransformer,
  KonvaTFM,
} from "../../components/KonvaTransformer";

export const Transformers = React.memo((): React.JSX.Element[] => {
  const { transformerRefs } = useShapesContext();

  // Store transformer
  const transformersRef = React.useRef<KonvaTFM[]>([
    {
      id: "cropper",
      borderStroke: "#00ff00",
      borderStrokeWidth: 1.5,
      borderDash: [10, 10],
      anchorStyleFunc: (anchor) => {
        if (anchor.hasName("top-center") || anchor.hasName("bottom-center")) {
          anchor.setAttrs({
            fill: "#a5ff00",
            stroke: "#00ff00",
            strokeWidth: 1,
            cornerRadius: 5,
            height: 10,
            offsetY: 5,
            width: 30,
            offsetX: 15,
          });
        } else if (
          anchor.hasName("middle-left") ||
          anchor.hasName("middle-right")
        ) {
          anchor.setAttrs({
            fill: "#a5ff00",
            stroke: "#00ff00",
            strokeWidth: 1,
            cornerRadius: 5,
            height: 30,
            offsetY: 15,
            width: 10,
            offsetX: 5,
          });
        } else if (anchor.hasName("rotater")) {
          anchor.setAttrs({
            fill: "#a5ff00",
            stroke: "#00ff00",
            strokeWidth: 1.5,
            cornerRadius: 10,
            height: 20,
            offsetY: 10,
            width: 20,
            offsetX: 10,
          });
        } else {
          anchor.setAttrs({
            fill: "#a5ff00",
            stroke: "#00ff00",
            strokeWidth: 1,
            cornerRadius: 5,
            height: 15,
            offsetY: 7.5,
            width: 15,
            offsetX: 7.5,
          });
        }
      },
    },
    {
      id: "transformer",
      borderStroke: "#ff0000",
      borderStrokeWidth: 1.5,
      borderDash: [20, 10],
      anchorStyleFunc: (anchor) => {
        if (anchor.hasName("top-center") || anchor.hasName("bottom-center")) {
          anchor.setAttrs({
            fill: "#ffa500",
            stroke: "#ff0000",
            strokeWidth: 1,
            cornerRadius: 2,
            height: 4,
            offsetY: 2,
            width: 16,
            offsetX: 8,
          });
        } else if (
          anchor.hasName("middle-left") ||
          anchor.hasName("middle-right")
        ) {
          anchor.setAttrs({
            fill: "#ffa500",
            stroke: "#ff0000",
            strokeWidth: 1,
            cornerRadius: 2,
            height: 16,
            offsetY: 8,
            width: 4,
            offsetX: 2,
          });
        } else if (anchor.hasName("rotater")) {
          anchor.setAttrs({
            fill: "#ffa500",
            stroke: "#ff0000",
            strokeWidth: 1.5,
            cornerRadius: 6,
            height: 12,
            offsetY: 6,
            width: 12,
            offsetX: 6,
          });
        } else {
          anchor.setAttrs({
            fill: "#ffa500",
            stroke: "#ff0000",
            strokeWidth: 1,
            cornerRadius: 4,
            height: 8,
            offsetY: 4,
            width: 8,
            offsetX: 4,
          });
        }
      },
    },
    {
      id: "single-transformer",
      borderStroke: "#0000ff",
      borderStrokeWidth: 1.5,
      borderDash: [20, 10],
      anchorStyleFunc: (anchor) => {
        if (anchor.hasName("top-center") || anchor.hasName("bottom-center")) {
          anchor.setAttrs({
            fill: "#00a5ff",
            stroke: "#0000ff",
            strokeWidth: 1,
            cornerRadius: 2,
            height: 4,
            offsetY: 2,
            width: 16,
            offsetX: 8,
          });
        } else if (
          anchor.hasName("middle-left") ||
          anchor.hasName("middle-right")
        ) {
          anchor.setAttrs({
            fill: "#00a5ff",
            stroke: "#0000ff",
            strokeWidth: 1,
            cornerRadius: 2,
            height: 16,
            offsetY: 8,
            width: 4,
            offsetX: 2,
          });
        } else if (anchor.hasName("rotater")) {
          anchor.setAttrs({
            fill: "#00a5ff",
            stroke: "#0000ff",
            strokeWidth: 1.5,
            cornerRadius: 6,
            height: 12,
            offsetY: 6,
            width: 12,
            offsetX: 6,
          });
        } else {
          anchor.setAttrs({
            fill: "#00a5ff",
            stroke: "#0000ff",
            strokeWidth: 1,
            cornerRadius: 4,
            height: 8,
            offsetY: 4,
            width: 8,
            offsetX: 4,
          });
        }
      },
    },
  ]);

  const handleOnMounted = React.useCallback(
    (id?: string, transformer?: KonvaTransformerAPI): void => {
      if (!transformerRefs[id]) {
        transformerRefs[id] = transformer;
      }
    },
    [transformerRefs]
  );

  const handleOnUnMounted = React.useCallback(
    (id?: string): void => {
      delete transformerRefs[id];
    },
    [transformerRefs]
  );

  const renderedTransformerList = React.useMemo(() => {
    return transformersRef.current.map((item) => (
      <KonvaTransformer
        key={item.id}
        transformerOption={item}
        onMounted={handleOnMounted}
        onUnMounted={handleOnUnMounted}
      />
    ));
  }, [handleOnMounted, handleOnUnMounted]);

  return renderedTransformerList;
});
