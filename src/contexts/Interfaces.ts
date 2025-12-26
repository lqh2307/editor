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
  setLanguage?: (lang: string) => void;

  setPanelWidth?: (width: number) => void;
  setPanelColor?: (color: string) => void;

  setCanvasColor?: (color: string) => void;

  setToolbarHeight?: (height: number) => void;
  setToolbarColor?: (color: string) => void;

  backgroundColor?: string;
  backgroundOpacity?: number;

  gridStyle?: KonvaGridStyle;

  guideLinesThreshold?: number;
  guideLinesStick?: boolean;

  language?: string;

  panelWidth?: number;
  panelColor?: string;

  canvasColor?: string;

  toolbarHeight?: number;
  toolbarColor?: string;

  snackBarAlert?: SnackbarAlertProp;

  stageMinWidth?: number;
  stageRatio?: number;
  stageZoomMin?: number;
  stageZoomMax?: number;
  stageZoomStep?: number;
  stageZoom?: number;
  stageWidth?: number;
  stageHeight?: number;

  drawingMode?: DrawingMode;

  setDrawingMode?: React.Dispatch<React.SetStateAction<DrawingMode>>;

  setStageRatio?: (ratio?: number) => void;
  setStageMinWidth?: (width?: number) => void;
  dragStage?: () => void;
  fitStage?: (resetZoom?: boolean) => void;
  setPointerStyle?: (style?: string) => void;
  expandStage?: (
    value: number,
    targetHeight?: boolean,
    position?: Vector2d
  ) => void;
  exportStage?: (format?: ImageFormat, crop?: boolean) => string;
  getStageCenter?: () => Vector2d;
  getStagePointerPosition?: (id?: string) => Vector2d;
  setStagePointerPosition?: (event: any) => void;
  setStageDragable?: (dragable: boolean) => void;
  getIsStageDragable?: () => boolean;
  setStageZoom?: (zoom: number, type?: "min" | "max" | "step") => void;
  zoomStage?: (zoomOut: boolean, pointer?: boolean) => void;
  getStage?: () => Konva.Stage;
  setStage?: (stage: Konva.Stage) => void;

  setGuideLinesThreshold?: (threshold: number) => void;
  setGuideLinesStick?: (auto: boolean) => void;
  getGuideLines?: () => KonvaGuideLinesAPI;
  setGuideLines?: (guideLines: KonvaGuideLinesAPI) => void;

  getBackground?: () => KonvaBackgroundAPI;
  setBackground?: (background: KonvaBackgroundAPI) => void;
  setBackgroundColor?: (color: string) => void;
  setBackgroundOpacity?: (opacity: number) => void;

  getGrid?: () => KonvaGridAPI;
  setGrid?: (grid: KonvaGridAPI) => void;
  setGridStyle?: (style: KonvaGridStyle) => void;

  updateSnackbarAlert?: (message: string, severity: AlertColor) => void;
}
