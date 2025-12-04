import Konva from "konva";

export type KonvaTFM = Partial<Konva.TransformerConfig> & {
  id?: string;
};

export type KonvaTransformerProp = {
  transformerOption?: KonvaTFM;

  // Callback handlers
  onMounted?: (id?: string, transformerAPI?: KonvaTransformerAPI) => void;
  onUnMounted?: (id?: string) => void;
  onDragStart?: (transformerAPI?: KonvaTransformerAPI) => void;
  onDragEnd?: (transformerAPI?: KonvaTransformerAPI) => void;
};

export type KonvaTransformerAPI = {
  updateProp: (prop?: KonvaTransformerProp) => void;
  updateTransformer: (transformer?: KonvaTFM) => void;
  getStage: () => Konva.Stage;
  getNode: () => Konva.Transformer;
  getTransformer: () => KonvaTFM;
};
