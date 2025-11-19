import Konva from "konva";

export type KonvaGuideLinesStyle = "none" | "solid" | "dotted";

export type KonvaGuideLinesProp = {
  id?: string;

  horizontalLines?: number[][];
  verticalLines?: number[][];

  style?: KonvaGuideLinesStyle;

  strokeWidth?: number;
  stroke?: string;
  opacity?: number;
};

export type KonvaGuideLinesAPI = {
  updateProp: (prop?: KonvaGuideLinesProp) => void;
  getNode: () => Konva.Group;
  getShape: () => KonvaGuideLinesProp;
};
