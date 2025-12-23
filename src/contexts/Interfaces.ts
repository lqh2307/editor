import { KonvaGridStyle, KonvaGridAPI } from "../components/KonvaGrid";
import { KonvaTransformerAPI } from "../components/KonvaTransformer";
import { KonvaBackgroundAPI } from "../components/KonvaBackground";
import { KonvaGuideLinesAPI } from "../components/KonvaGuideLines";
import { HorizontalAlign, VerticalAlign } from "../types/Window";
import { SnackbarAlertProp } from "../components/SnackbarAlert";
import { DrawingMode } from "../types/FreeDrawing";
import { ImageFormat } from "../types/Common";
import { AlertColor } from "@mui/material";
import { Vector2d } from "konva/lib/types";
import Konva from "konva";
import {
  KonvaShapeAPI,
  LayerAction,
  KonvaShape,
} from "../components/KonvaShape";

export interface IShapesContext {
  maxHistory?: number;
  canUndo?: boolean;
  canRedo?: boolean;

  edittedId?: string;
  updateEdittedId?: (id?: string) => void;
  selectedIds?: Record<string, boolean>;
  updateSelectedIds?: (ids?: string[], overwrite?: boolean) => void;
  singleSelectedIds?: Record<string, boolean>;
  updateSingleSelectedIds?: (ids?: string[], overwrite?: boolean) => void;

  selectedGroupIds?: string[];
  selectedShape?: KonvaShape;
  shapeList?: KonvaShape[];
  copiedShapes?: KonvaShape[];
  shapeRefs?: Record<string, KonvaShapeAPI>;
  transformerRefs?: Record<string, KonvaTransformerAPI>;

  setMaxHistory?: (max: number) => void;

  groupShapes?: (ids?: string[], unGroup?: boolean) => void;
  moveShapes?: (ids: string[], offsetX: number, offsetY: number) => void;
  exportShapes?: (save?: boolean, fileName?: string) => Promise<string>;
  addShapes?: (
    shapes: KonvaShape[],
    overwrite?: boolean,
    processBase64ImageURL?: boolean,
    position?: Vector2d
  ) => Promise<void>;
  deleteShapes?: (ids?: string[]) => void;
  updateShape?: (
    shape?: KonvaShape,
    render?: boolean,
    storeHistory?: boolean
  ) => void;
  pasteShape?: (position?: Vector2d) => void;
  duplicateShape?: (ids?: string[], position?: Vector2d) => void;
  copyShape?: (ids?: string[], cut?: boolean) => void;
  layerShape?: (id?: string, type?: LayerAction) => void;
  alignShape?: (
    id?: string,
    horizontalAlign?: HorizontalAlign,
    verticalAlign?: VerticalAlign
  ) => void;
  flipShape?: (id?: string, vertical?: boolean) => void;
  cleanHistory?: () => void;
  doShapes?: (redo?: boolean) => void;
}

export interface IDrawingContext {
  drawingMode?: DrawingMode;
  setDrawingMode?: React.Dispatch<React.SetStateAction<DrawingMode>>;
}

export interface IStageContext {
  language?: string;
  updateLanguage?: (lang: string) => void;

  guideLinesThreshold?: number;
  setGuideLinesThreshold?: (threshold: number) => void;

  guideLinesStick?: boolean;
  setGuideLinesStick?: (auto: boolean) => void;

  panelWidth?: number;
  setPanelWidth?: (width: number) => void;
  panelColor?: string;
  setPanelColor?: (color: string) => void;

  canvasColor?: string;
  setCanvasColor?: (color: string) => void;

  toolbarHeight?: number;
  setToolbarHeight?: (height: number) => void;
  toolbarColor?: string;
  setToolbarColor?: (color: string) => void;

  stageMinWidth?: number;
  setStageMinWidth?: (width: number) => void;
  stageRatio?: number;
  setStageRatio?: (ratio: number) => void;

  canvasWidth?: number;
  canvasHeight?: number;
  stageZoom?: number;
  stageZoomMin?: number;
  stageZoomMax?: number;
  stageZoomStep?: number;
  stageWidth?: number;
  stageHeight?: number;

  setStageZoom?: (zoom: number, type?: "min" | "max" | "step") => void;
  zoomStage?: (zoomOut: boolean, pointer?: boolean) => void;

  dragStage?: () => void;
  fitStageScreen?: (resetZoom?: boolean) => void;
  setPointerStyle?: (style?: string) => void;
  expandStage?: (
    newValue: number,
    targetHeight?: boolean,
    newX?: number,
    newY?: number
  ) => void;
  exportStage?: (format?: ImageFormat, crop?: boolean) => string;
  getStageCenter?: () => Vector2d;
  getStagePointerPosition?: (id?: string) => Vector2d;
  setStagePointerPosition?: (event: any) => void;
  setStageDragable?: (dragable: boolean) => void;
  getIsStageDragable?: () => boolean;
  setCanvasSize?: (width: number, height: number) => void;

  getStage?: () => Konva.Stage;
  setStage?: (stage: Konva.Stage) => void;

  getGuideLines?: () => KonvaGuideLinesAPI;
  setGuideLines?: (guideLines: KonvaGuideLinesAPI) => void;

  backgroundColor?: string;
  backgroundOpacity?: number;
  getBackground?: () => KonvaBackgroundAPI;
  setBackground?: (background: KonvaBackgroundAPI) => void;
  updateBackgroundColor?: (color: string) => void;
  updateBackgroundOpacity?: (opacity: number) => void;

  gridStyle?: KonvaGridStyle;
  getGrid?: () => KonvaGridAPI;
  setGrid?: (grid: KonvaGridAPI) => void;
  updateGridStyle?: (style: KonvaGridStyle) => void;

  snackBarAlert?: SnackbarAlertProp;
  updateSnackbarAlert?: (message: string, severity: AlertColor) => void;
}
