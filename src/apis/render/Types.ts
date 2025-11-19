import { BBox, ImageFormat, Size, TileSize } from "../../types/Common";
import { LineStyle } from "../../types/Line";
import {
  HorizontalAlign,
  VerticalAlign,
  Orientation,
  Fit,
} from "../../types/Window";

export type RenderPDFInput = {
  images: string[];
};

export type RenderPDFPreview = {
  format?: ImageFormat;
  width?: number;
  height?: number;
  lineColor?: string;
  lineWidth?: number;
  lineStyle?: LineStyle;
};

export type RenderPDFAlignContent = {
  horizontal?: HorizontalAlign;
  vertical?: VerticalAlign;
};

export type RenderPDFAlignPagination = {
  horizontal?: HorizontalAlign;
  vertical?: VerticalAlign;
};

export type RenderPDFGrid = {
  row?: number;
  column?: number;
  marginX?: number;
  marginY?: number;
  gapX?: number;
  gapY?: number;
};

export type RenderPDFOutput = {
  alignContent?: RenderPDFAlignContent;
  base64?: boolean;
  grayscale?: boolean;
  orientation?: Orientation;
  paperSize: Size;
  fit?: Fit;
  grid?: RenderPDFGrid;
  pagination?: RenderPDFAlignPagination;
};

export type RenderPDFOption = {
  controller?: AbortController;

  input: RenderPDFInput;
  preview?: RenderPDFPreview;
  output: RenderPDFOutput;
};

export type RenderHighQualityPDFImage = {
  image: string;
  resolution?: Size;
};

export type RenderHighQualityPDFInput = {
  images: RenderHighQualityPDFImage[];
};

export type RenderHighQualityPDFPreview = {
  format?: ImageFormat;
  width?: number;
  height?: number;
  lineColor?: string;
  lineWidth?: number;
  lineStyle?: LineStyle;
  pageColor?: string;
  pageSize?: number;
  pageFont?: string;
};

export type RenderHighQualityPDFAlignContent = {
  horizontal?: HorizontalAlign;
  vertical?: VerticalAlign;
};

export type RenderHighQualityPDFOutput = {
  alignContent?: RenderPDFAlignContent;
  base64?: boolean;
  grayscale?: boolean;
  orientation?: Orientation;
  paperSize: Size;
};

export type RenderHighQualityPDFOption = {
  controller?: AbortController;

  input: RenderHighQualityPDFInput;
  preview?: RenderHighQualityPDFPreview;
  output: RenderHighQualityPDFOutput;
};

export type RenderStyleJSONOverlay = {
  controller?: AbortController;

  styleJSON: any;
  zoom: number;
  bbox: BBox;
  tileScale?: number;
  tileSize?: TileSize;
  base64?: boolean;
  grayscale?: boolean;
  format?: ImageFormat;
  width?: number;
  height?: number;
  pitch?: number;
  bearing?: number;
};

export type RenderStyleJSONsOption = {
  controller?: AbortController;

  overlays: RenderStyleJSONOverlay[];
};

export type RenderSVGOverlay = {
  image: string;
  width?: number;
  height?: number;
  format?: ImageFormat;
  base64?: boolean;
  grayscale?: boolean;
};

export type RenderSVGsOption = {
  controller?: AbortController;

  overlays: RenderSVGOverlay[];
};

export type AddFrameInput = {
  image: string;
  bbox: BBox;
};

export type AddFrameOverlay = {
  image: string;
  bbox?: BBox;
};

export type AddFrameFrame = {
  frameMargin?: number;
  frameInnerColor?: string;
  frameInnerWidth?: number;
  frameInnerStyle?: LineStyle;
  frameOuterColor?: string;
  frameOuterWidth?: number;
  frameOuterStyle?: LineStyle;
  frameSpace?: number;
  tickLabelFormat?: "D" | "DMS" | "DMSD";
  majorTickStep?: number;
  minorTickStep?: number;
  majorTickWidth?: number;
  minorTickWidth?: number;
  majorTickSize?: number;
  minorTickSize?: number;
  majorTickLabelSize?: number;
  minorTickLabelSize?: number;
  majorTickColor?: string;
  minorTickColor?: string;
  majorTickLabelColor?: string;
  minorTickLabelColor?: string;
  majorTickLabelFont?: string;
  minorTickLabelFont?: string;
  xTickLabelOffset?: number;
  yTickLabelOffset?: number;
  xTickMajorLabelRotation?: number;
  xTickMinorLabelRotation?: number;
  yTickMajorLabelRotation?: number;
  yTickMinorLabelRotation?: number;
};

export type AddFrameGrid = {
  majorGridWidth?: number;
  majorGridStep?: number;
  majorGridColor?: string;
  majorGridStyle?: LineStyle;
  minorGridWidth?: number;
  minorGridStep?: number;
  minorGridColor?: string;
  minorGridStyle?: LineStyle;
};

export type AddFrameOutput = {
  format?: ImageFormat;
  base64?: boolean;
  grayscale?: boolean;
};

export type AddFrameOption = {
  controller?: AbortController;

  input: AddFrameInput;
  overlays?: AddFrameOverlay[];
  frame?: AddFrameFrame;
  grid?: AddFrameGrid;
  output: AddFrameOutput;
};
