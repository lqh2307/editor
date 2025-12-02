import { KonvaFreeDrawingLine } from "../../components/KonvaShape";
import { FreeDrawingMode } from "../../types/FreeDrawing";

export type FreeDrawingInfo = {
  previousMode?: FreeDrawingMode;
  lines?: KonvaFreeDrawingLine[];
  isDrawing?: boolean;
  shapeId?: string;
  // Polyline specific state
  polylinePoints?: number[];
  polylineOrigin?: { x: number; y: number };
  isPolylineDrawing?: boolean;
};
