import Konva from "konva";

export type KonvaTransformerProp = Partial<Konva.TransformerConfig> & {
  id?: string;
};

export type KonvaTransformerAPI = {
  updateProp: (prop?: KonvaTransformerProp) => void;
  getNode: () => Konva.Transformer;
  getShape: () => KonvaTransformerProp;
};
