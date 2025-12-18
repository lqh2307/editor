import { KonvaShapeType } from "../../components/KonvaShape";
import { Size } from "../Common";

export type KonvaDragDrop = {
  type?: KonvaShapeType;
  imageURL?: string;
  resolution?: Size;
  componentURL?: string;
  svgURL?: string;
  pathURL?: string;
};
