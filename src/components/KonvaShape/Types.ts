import { Size } from "../../types/Common";
import Konva from "konva";

export type KonvaShape = Partial<
  Konva.ImageConfig &
    Konva.CircleConfig &
    Konva.EllipseConfig &
    Konva.RectConfig &
    Konva.LineConfig &
    Konva.TextConfig &
    Konva.ArrowConfig &
    Konva.RegularPolygonConfig &
    Konva.StarConfig &
    Konva.RingConfig &
    Konva.WedgeConfig
> & {
  // Extend
  type?: KonvaShapeType;
  box?: KonvaShapeBox;

  // Filter
  brightness?: number;
  contrast?: number;
  blurRadius?: number;
  enhance?: number;
  noise?: number;
  pixelSize?: number;
  grayscale?: boolean;
  invert?: boolean;
  sepia?: boolean;
  solarize?: boolean;

  // Free drawing
  lines?: KonvaFreeDrawingLine[];

  // Path
  paths?: Konva.PathConfig[];

  // Image/Video
  imageURL?: string;
  imageBlob?: Blob;
  resolution?: Size;
  isPlay?: boolean;
  speed?: number;
  volume?: number;
  loop?: boolean;
  inverse?: boolean;

  // Color
  fillOpacity?: number;
  strokeOpacity?: number;

  // Text
  fontWeight?: string;
};

export type KonvaShapeType =
  | "image"
  | "video"
  | "ellipse"
  | "circle"
  | "rectangle"
  | "convex-polygon"
  | "concave-polygon"
  | "text"
  | "line"
  | "free-drawing"
  | "path"
  | "arrow"
  | "ring"
  | "wedge";

export type KonvaShapeBox = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  centerX?: number;
  centerY?: number;
};

export type KonvaFreeDrawingLine = Omit<Konva.LineConfig, "points"> & {
  points: number[];
};

export type KonvaShapeProp = {
  isSelected?: boolean;
  isCroped?: boolean;

  // Shape options
  shapeOption?: KonvaShape;

  // Callback handlers
  onMounted?: (id?: string, shapeAPI?: KonvaShapeAPI) => void;
  onUnMounted?: (id?: string) => void;
  onAppliedProp?: (shapeAPI?: KonvaShapeAPI, reason?: RenderReason) => void;
  onClick?: (
    e?: Konva.KonvaEventObject<MouseEvent>,
    shapeAPI?: KonvaShapeAPI
  ) => void;
  onDragMove?: (shapeAPI?: KonvaShapeAPI) => void;
  onMouseOver?: (shapeAPI?: KonvaShapeAPI) => void;
  onMouseLeave?: (shapeAPI?: KonvaShapeAPI) => void;
};

export type KonvaShapeAPI = {
  updateProp: (prop?: KonvaShapeProp) => void;
  updateShape: (shape?: KonvaShape) => void;
  getNode: () => Konva.Node;
  getShape: () => KonvaShape;
};

export type LayerAction = "back" | "front" | "backward" | "forward";
export type RenderReason =
  | "apply-prop"
  | "drag-end"
  | "transform-end"
  | "commit";
