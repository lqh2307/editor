import Konva from "konva";

export type KonvaGridStyle = "none" | "solid" | "dotted";

export type KonvaGridProp = {
  id?: string;

  width?: number;
  height?: number;

  style?: KonvaGridStyle;

  gap?: number;
  strokeWidth?: number;
  stroke?: string;
  opacity?: number;
};

export type KonvaGridAPI = {
  updateProp: (prop?: KonvaGridProp) => void;
  getNode: () => Konva.Group;
  getShape: () => KonvaGridProp;
};
