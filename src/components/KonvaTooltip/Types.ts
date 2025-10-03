import Konva from "konva";

export type KonvaTooltipProp = {
  id?: string;

  text?: string;
  textColor?: string;
  textOpacity?: number;
  fontSize?: number;

  backgroundColor?: string;
  backgroundOpacity?: number;

  x?: number;
  y?: number;
  padding?: number;
};

export type KonvaTooltipAPI = {
  updateProp: (prop?: KonvaTooltipProp) => void;
  getNode: () => Konva.Label;
  getShape: () => KonvaTooltipProp;
};
