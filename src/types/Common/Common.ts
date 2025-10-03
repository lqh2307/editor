export type TileSize = 256 | 512;
export type TileScheme = "tms" | "xyz";
export type BBox = [number, number, number, number];
export type Extent = [number, number, number, number];
export type Point = [number, number];
export type Size = [number, number];

export type Unit = "km" | "hm" | "dam" | "m" | "dm" | "cm" | "mm";

export type ImageFormat = "png" | "jpg" | "jpeg" | "gif" | "webp";
export type TextFormat = "svg" | "pbf" | "xml" | "json" | "geojson" | "pdf";
export type Format = ImageFormat | TextFormat;

export type DDMMSS = {
  degree: number;
  minute: number;
  second: number;
};
