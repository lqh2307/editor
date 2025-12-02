import Konva from "konva";

export type KonvaTransformerProp = Partial<Konva.TransformerConfig> & {
  id?: string;

  onDragStart?: (shapeAPI?: KonvaTransformerAPI) => void;
  onDragMove?: (shapeAPI?: KonvaTransformerAPI) => void;
};

export type KonvaTransformerAPI = {
  updateProp: (prop?: KonvaTransformerProp) => void;
  getStage: () => Konva.Stage;
  getNode: () => Konva.Node;
  getShape: () => KonvaTransformerProp;
};
