import Konva from "konva";

export type KonvaBackgroundProp = {
  id?: string;

  width?: number;
  height?: number;

  fill?: string;
  opacity?: number;
};

export type KonvaBackgroundAPI = {
  updateProp: (prop?: KonvaBackgroundProp) => void;
  getNode: () => Konva.Rect;
  getShape: () => KonvaBackgroundProp;
};
