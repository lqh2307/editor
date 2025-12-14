import { KonvaFreeDrawingLine } from "../../components/KonvaShape";
import { DrawingMode } from "../../types/FreeDrawing";

export type DrawingInfo = {
  previousMode?: DrawingMode;
  lines?: KonvaFreeDrawingLine[];
  points?: number[];
  isDrawing?: boolean;
  shapeId?: string;
};
