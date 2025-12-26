import { KonvaLineStyle } from "../../types/Konva";
import { Point, Size } from "../../types/Common";
import Konva from "konva";

export type KonvaShape = Partial<Konva.ShapeConfig> &
  Partial<Konva.ImageConfig> &
  Partial<Konva.CircleConfig> &
  Partial<Konva.EllipseConfig> &
  Partial<Konva.RectConfig> &
  Partial<Konva.LineConfig> &
  Partial<Konva.TextConfig> &
  Partial<Konva.ArrowConfig> &
  Partial<Konva.RegularPolygonConfig> &
  Partial<Konva.StarConfig> &
  Partial<Konva.RingConfig> &
  Partial<Konva.WedgeConfig> & {
    // Extend
    originGroupIds?: any[];
    groupIds?: any[];
    type?: KonvaShapeType;
    box?: KonvaShapeBox;
    clip?: KonvaShapeClip;
    coordinate?: Point;

    // Map history: array of lat/lon points
    locationHistory?: { lat: number; lon: number }[];

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
    rgba?: boolean;

    // Free drawing
    lines?: KonvaFreeDrawingLine[];

    // Line
    lineStyle?: KonvaLineStyle;

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
    rgbaColor?: string;
    rgbaOpacity?: number;

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
  | "multi-line"
  | "multi-arrow"
  | "multi-line-curve"
  | "multi-arrow-curve"
  | "path"
  | "arrow"
  | "ring"
  | "wedge"
  | "quadratic-curve"
  | "quadratic-arrow-curve"
  | "bezier-curve"
  | "bezier-arrow-curve";

export type KonvaShapeBox = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  centerX?: number;
  centerY?: number;
  localOffsetX?: number;
  localOffsetY?: number;
};

export type KonvaShapeClip = {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
};

export type KonvaFreeDrawingLine = Omit<Konva.LineConfig, "points"> & {
  points: number[];
};

export type KonvaShapeProp = {
  isSelected?: boolean;
  isEditted?: boolean;

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
  onDblClick?: (shapeAPI?: KonvaShapeAPI) => void;
  onMouseDown?: (shapeAPI?: KonvaShapeAPI) => void;
  onMouseUp?: (shapeAPI?: KonvaShapeAPI) => void;
  onDragMove?: (shapeAPI?: KonvaShapeAPI) => void;
  onMouseOver?: (shapeAPI?: KonvaShapeAPI) => void;
  onMouseLeave?: (shapeAPI?: KonvaShapeAPI) => void;
};

export type KonvaShapeAPI = {
  updateProp: (prop?: KonvaShapeProp) => void;
  updateShape: (shape?: KonvaShape) => void;
  getStage: () => Konva.Stage;
  getNode: () => Konva.Node;
  getShape: () => KonvaShape;
};

export type LayerAction = "back" | "front" | "backward" | "forward";
export type RenderReason =
  | "apply-prop"
  | "drag-end"
  | "control-drag-end"
  | "transform-end"
  | "commit";
