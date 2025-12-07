import { Size } from "../../types/Common";
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
    groupIds?: any[];
    type?: KonvaShapeType;
    box?: KonvaShapeBox;
    clip?: KonvaShapeClip;

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
  | "wedge"
  | "quadratic-curve"
  | "bezier-curve";

export type KonvaShapeBox = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  centerX?: number;
  centerY?: number;
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
  isCropped?: boolean;

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
  | "transform-end"
  | "commit";
