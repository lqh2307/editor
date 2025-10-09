import { BBox, Point, TileScheme, TileSize, Unit } from "../../types/Common";
import { WindowSize } from "../../types/Window";
import { convertLength } from "../Utils";
import { loadImageSrc } from "../Image";
import { limitValue } from "../Number";

/**
 * Convert coordinates from EPSG:4326 (lon, lat) to EPSG:3857 (x, y in meters)
 * @param {number} lon Longitude in degree
 * @param {number} lat Latitude in degree
 * @returns {Point} Web Mercator x, y in meters
 */
export function lonLat4326ToXY3857(lon: number, lat: number): Point {
  lon = limitValue(lon, -180, 180);
  lat = limitValue(lat, -85.051129, 85.051129);

  return [
    lon * (Math.PI / 180) * 6378137.0,
    Math.log(Math.tan(Math.PI / 4 + lat * (Math.PI / 360))) * 6378137.0,
  ];
}

/**
 * Convert coordinates from EPSG:3857 (x, y in meters) to EPSG:4326 (lon, lat in degree)
 * @param {number} x X in meters (Web Mercator)
 * @param {number} y Y in meters (Web Mercator)
 * @returns {Point} Longitude and latitude in degree
 */
export function xy3857ToLonLat4326(x: number, y: number): Point {
  let lon: number = (x / 6378137.0) * (180 / Math.PI);
  let lat: number = Math.atan(Math.sinh(y / 6378137.0)) * (180 / Math.PI);

  lon = limitValue(lon, -180, 180);
  lat = limitValue(lat, -85.051129, 85.051129);

  return [lon, lat];
}

/**
 * Get xyz tile indices from longitude, latitude, and zoom level
 * @param {number} lon Longitude in EPSG:4326
 * @param {number} lat Latitude in EPSG:4326
 * @param {number} z Zoom level
 * @param {TileScheme} scheme Tile scheme to output (Default: XYZ)
 * @param {TileSize} tileSize Tile size
 * @returns {[number, number, number]} Tile indices [x, y, z]
 */
export function getXYZFromLonLatZ(
  lon: number,
  lat: number,
  z: number,
  scheme: TileScheme,
  tileSize: TileSize
): [number, number, number] {
  tileSize = tileSize || 256;
  const size: number = tileSize * (1 << z);
  const bc: number = size / 360;
  const cc: number = size / 2 / Math.PI;
  const zc: number = size / 2;
  const maxTileIndex: number = (1 << z) - 1;

  lon = limitValue(lon, -180, 180);
  lat = limitValue(lat, -85.051129, 85.051129);

  let x: number = Math.floor((zc + lon * bc) / tileSize);
  let y: number = Math.floor(
    (zc - cc * Math.log(Math.tan(Math.PI / 4 + lat * (Math.PI / 360)))) /
      tileSize
  );

  if (scheme === "tms") {
    y = maxTileIndex - y;
  }

  x = limitValue(x, 0, maxTileIndex);
  y = limitValue(y, 0, maxTileIndex);

  return [x, y, z];
}

/**
 * Get longitude, latitude from z/x/y (Default: XYZ)
 * @param {number} x X tile index
 * @param {number} y Y tile index
 * @param {number} z Zoom level
 * @param {"center"|"topLeft"|"bottomRight"} position Tile position: "center", "topLeft", or "bottomRight"
 * @param {TileScheme} scheme Tile scheme
 * @param {TileSize} tileSize Tile size
 * @returns {Point} [longitude, latitude] in EPSG:4326
 */
export function getLonLatFromXYZ(
  x: number,
  y: number,
  z: number,
  position: "center" | "topLeft" | "bottomRight",
  scheme: TileScheme,
  tileSize: TileSize
): Point {
  tileSize = tileSize || 256;
  const size: number = tileSize * (1 << z);
  const bc: number = size / 360;
  const cc: number = size / 2 / Math.PI;
  const zc: number = size / 2;

  let px: number = x * tileSize;
  let py: number = y * tileSize;

  if (position === "center") {
    px += tileSize / 2;
    py += tileSize / 2;
  } else if (position === "bottomRight") {
    px += tileSize;
    py += tileSize;
  }

  if (scheme === "tms") {
    py = size - py;
  }

  return [
    (px - zc) / bc,
    (180 / Math.PI) * (2 * Math.atan(Math.exp((zc - py) / cc)) - Math.PI / 2),
  ];
}

/**
 * Get pyramid tile ranges
 * @param {number} z Zoom level
 * @param {number} x X tile index
 * @param {number} y Y tile index
 * @param {TileScheme} scheme Tile scheme
 * @param {number} deltaZ Delta zoom
 * @returns {{ x: [number, number], y: [number, number] }}
 */
export function getPyramidTileRanges(
  z: number,
  x: number,
  y: number,
  scheme: TileScheme,
  deltaZ: number
): {
  x: [number, number];
  y: [number, number];
} {
  const factor: number = 1 << deltaZ;

  const minX: number = x * factor;
  const maxX: number = (x + 1) * factor - 1;
  const minY: number = y * factor;
  const maxY: number = (y + 1) * factor - 1;

  if (scheme === "tms") {
    const maxTileIndex: number = (1 << (z + deltaZ)) - 1;

    return {
      x: [minX, maxX],
      y: [maxTileIndex - maxY, maxTileIndex - minY],
    };
  }

  return {
    x: [minX, maxX],
    y: [minY, maxY],
  };
}

/**
 * Calculate zoom levels
 * @param {BBox} bbox Bounding box in EPSG:4326
 * @param {number} width Width of image
 * @param {number} height Height of image
 * @param {TileSize} tileSize Tile size
 * @returns {Promise<{ minZoom: number, maxZoom: number }>} Zoom levels
 */
export async function calculateZoomLevels(
  bbox: BBox,
  width: number,
  height: number,
  tileSize: TileSize
): Promise<{ minZoom: number; maxZoom: number }> {
  tileSize = tileSize || 256;

  const [xRes, yRes]: [number, number] = await calculateResolution(
    {
      bbox: bbox,
      width: width,
      height: height,
    },
    "m"
  );

  const res: number = xRes <= yRes ? xRes : yRes;

  const maxZoom: number = limitValue(
    Math.round(Math.log2((2 * Math.PI * 6378137.0) / tileSize / res)),
    0,
    25
  );

  let minZoom = maxZoom;

  const targetTileSize: number = Math.floor(tileSize * 0.95);

  while (minZoom > 0 && (width > targetTileSize || height > targetTileSize)) {
    width /= 2;
    height /= 2;

    minZoom--;
  }

  return {
    minZoom,
    maxZoom,
  };
}

/**
 * Get grids for specific bbox with optional lat/lon steps (Keeps both head and tail residuals)
 * @param {BBox} bbox [minLon, minLat, maxLon, maxLat]
 * @param {number} lonStep Step for longitude
 * @param {number} latStep Step for latitude
 * @returns {BBox[]}
 */
export function splitBBox(
  bbox: BBox,
  lonStep?: number,
  latStep?: number
): BBox[] {
  const result: BBox[] = [];

  function splitStep(start: number, end: number, step: number): Point[] {
    const ranges: Point[] = [];

    let cur: number = Math.ceil(start / step) * step;

    if (cur > end) {
      return [[start, end]];
    }

    if (start < cur) {
      ranges.push([start, cur]);
    }

    while (cur + step <= end) {
      ranges.push([cur, cur + step]);

      cur += step;
    }

    if (cur < end) {
      ranges.push([cur, end]);
    }

    return ranges;
  }

  const lonRanges: Point[] = lonStep
    ? splitStep(bbox[0], bbox[2], lonStep)
    : [[bbox[0], bbox[2]]];
  const latRanges: Point[] = latStep
    ? splitStep(bbox[1], bbox[3], latStep)
    : [[bbox[1], bbox[3]]];

  for (const [lonStart, lonEnd] of lonRanges) {
    for (const [latStart, latEnd] of latRanges) {
      result.push([lonStart, latStart, lonEnd, latEnd]);
    }
  }

  return result;
}

/**
 * Calculate sizes
 * @param {number} z Zoom level
 * @param {BBox} bbox Bounding box in EPSG:4326
 * @param {TileSize} tileSize Tile size
 * @returns {WindowSize} Sizes
 */
export function calculateSizes(
  z: number,
  bbox: BBox,
  tileSize?: TileSize
): WindowSize {
  tileSize = tileSize || 512;

  const [minX, minY]: Point = lonLat4326ToXY3857(bbox[0], bbox[1]);
  const [maxX, maxY]: Point = lonLat4326ToXY3857(bbox[2], bbox[3]);

  const resolution: number =
    (2 * Math.PI * 6378137.0) / (tileSize * Math.pow(2, z));

  return {
    width: Math.round((maxX - minX) / resolution),
    height: Math.round((maxY - minY) / resolution),
  };
}

/**
 * Convert tile indices to a bounding box that intersects the outer tiles
 * @param {number} xMin Minimum x tile index
 * @param {number} yMin Minimum y tile index
 * @param {number} xMax Maximum x tile index
 * @param {number} yMax Maximum y tile index
 * @param {number} z Zoom level
 * @param {TileScheme} scheme Tile scheme
 * @param {TileSize} tileSize Tile size
 * @returns {BBox} Bounding box [lonMin, latMin, lonMax, latMax] in EPSG:4326
 */
export function getBBoxFromTiles(
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number,
  z: number,
  scheme: TileScheme,
  tileSize: TileSize
): BBox {
  let [lonMin, latMax]: Point = getLonLatFromXYZ(
    xMin,
    yMin,
    z,
    "topLeft",
    scheme,
    tileSize
  );
  let [lonMax, latMin]: Point = getLonLatFromXYZ(
    xMax,
    yMax,
    z,
    "bottomRight",
    scheme,
    tileSize
  );

  if (lonMin > lonMax) {
    [lonMin, lonMax] = [lonMax, lonMin];
  }

  if (latMin > latMax) {
    [latMin, latMax] = [latMax, latMin];
  }

  return [lonMin, latMin, lonMax, latMax];
}

/**
 * Convert bbox to tiles
 * @param {BBox} bbox Bounding box [lonMin, latMin, lonMax, latMax] in EPSG:4326
 * @param {number} z Zoom level
 * @param {TileScheme} scheme Tile scheme
 * @param {TileSize} tileSize Tile size
 * @returns {[number, number, number, number]} Tiles [minX, maxX, minY, maxY]
 */
export function getTilesFromBBox(
  bbox: BBox,
  z: number,
  scheme: TileScheme,
  tileSize: TileSize
): [number, number, number, number] {
  let [xMin, yMin] = getXYZFromLonLatZ(bbox[0], bbox[3], z, scheme, tileSize);
  let [xMax, yMax] = getXYZFromLonLatZ(bbox[2], bbox[1], z, scheme, tileSize);

  if (xMin > xMax) {
    [xMin, xMax] = [xMax, xMin];
  }

  if (yMin > yMax) {
    [yMin, yMax] = [yMax, yMin];
  }

  return [xMin, yMin, xMax, yMax];
}

/**
 * Get real bbox
 * @param {BBox} bbox Bounding box [lonMin, latMin, lonMax, latMax] in EPSG:4326
 * @param {number} z Zoom level
 * @param {TileScheme} scheme Tile scheme
 * @param {TileSize} tileSize Tile size
 * @returns {BBox} Bounding box [lonMin, latMin, lonMax, latMax] in EPSG:4326
 */
export function getRealBBox(
  bbox: BBox,
  z: number,
  scheme: TileScheme,
  tileSize: TileSize
): BBox {
  let [xMin, yMin, xMax, yMax]: [number, number, number, number] =
    getTilesFromBBox(bbox, z, scheme, tileSize);

  return getBBoxFromTiles(xMin, yMin, xMax, yMax, z, scheme, tileSize);
}

/**
 * Get bounding box from center and radius
 * @param {Point} center [lon, lat] of center (EPSG:4326)
 * @param {number} radius Radius in metter (EPSG:3857)
 * @returns {BBox} [minLon, minLat, maxLon, maxLat]
 */
export function getBBoxFromCircle(center: Point, radius: number): BBox {
  const [xCenter, yCenter]: Point = lonLat4326ToXY3857(center[0], center[1]);

  return [
    ...xy3857ToLonLat4326(xCenter - radius, yCenter - radius),
    ...xy3857ToLonLat4326(xCenter + radius, yCenter + radius),
  ];
}

/**
 * Get bounding box from an array of points
 * @param {Point[]} points Array of points in the format [lon, lat]
 * @returns {BBox} Bounding box in the format [minLon, minLat, maxLon, maxLat]
 */
export function getBBoxFromPoints(points: Point[]): BBox {
  let bbox: BBox;

  if (points.length) {
    bbox = [points[0][0], points[0][1], points[0][0], points[0][1]];

    for (let index = 1; index < points.length; index++) {
      if (points[index][0] < bbox[0]) {
        bbox[0] = points[index][0];
      }

      if (points[index][1] < bbox[1]) {
        bbox[1] = points[index][1];
      }

      if (points[index][0] > bbox[2]) {
        bbox[2] = points[index][0];
      }

      if (points[index][1] > bbox[3]) {
        bbox[3] = points[index][1];
      }
    }

    bbox[0] = limitValue(bbox[0], -180, 180);
    bbox[2] = limitValue(bbox[2], -180, 180);
    bbox[1] = limitValue(bbox[1], -85.051129, 85.051129);
    bbox[3] = limitValue(bbox[3], -85.051129, 85.051129);
  }

  return bbox;
}

/**
 * Get bounding box intersect
 * @param {BBox} bbox1 Bounding box 1 in the format [minLon, minLat, maxLon, maxLat]
 * @param {BBox} bbox2 Bounding box 2 in the format [minLon, minLat, maxLon, maxLat]
 * @returns {BBox} Intersect bounding box in the format [minLon, minLat, maxLon, maxLat]
 */
export function getIntersectBBox(bbox1: BBox, bbox2: BBox): BBox {
  const minLon: number = bbox1[0] >= bbox2[0] ? bbox1[0] : bbox2[0];
  const minLat: number = bbox1[1] >= bbox2[1] ? bbox1[1] : bbox2[1];
  const maxLon: number = bbox1[2] <= bbox2[2] ? bbox1[2] : bbox2[2];
  const maxLat: number = bbox1[3] <= bbox2[3] ? bbox1[3] : bbox2[3];

  if (minLon >= maxLon || minLat >= maxLat) {
    return;
  }

  return [minLon, minLat, maxLon, maxLat];
}

/**
 * Get bounding box cover
 * @param {BBox} bbox1 Bounding box 1 in the format [minLon, minLat, maxLon, maxLat]
 * @param {BBox} bbox2 Bounding box 2 in the format [minLon, minLat, maxLon, maxLat]
 * @returns {BBox} Cover bounding box in the format [minLon, minLat, maxLon, maxLat]
 */
export function getCoverBBox(bbox1: BBox, bbox2: BBox): BBox {
  const minLon: number = bbox1[0] < bbox2[0] ? bbox1[0] : bbox2[0];
  const minLat: number = bbox1[1] < bbox2[1] ? bbox1[1] : bbox2[1];
  const maxLon: number = bbox1[2] > bbox2[2] ? bbox1[2] : bbox2[2];
  const maxLat: number = bbox1[3] > bbox2[3] ? bbox1[3] : bbox2[3];

  return [minLon, minLat, maxLon, maxLat];
}

/**
 * Convert zoom to scale
 * @param {number} zoom Zoom
 * @param {number} ppi Pixel per inch
 * @param {TileSize} tileSize Tile size
 * @returns {number} Scale
 */
export function zoomToScale(
  zoom: number,
  ppi: number,
  tileSize: TileSize
): number {
  ppi = ppi || 96;

  return (
    (ppi * ((2 * Math.PI * 6378137.0) / tileSize / Math.pow(2, zoom))) / 0.0254
  );
}

/**
 * Convert scale to zoom
 * @param {number} scale Scale
 * @param {number} ppi Pixel per inch
 * @param {TileSize} tileSize Tile size
 * @returns {number} zoom
 */
export function scaleToZoom(
  scale: number,
  ppi: number,
  tileSize: TileSize
): number {
  ppi = ppi || 96;

  return Math.log2(
    ppi * ((2 * Math.PI * 6378137.0) / tileSize / scale / 0.0254)
  );
}

/**
 * Calculate resolution
 * @param {{ image: string, bbox: BBox, width: number, height: number }} input Input object
 * @param {Unit} unit unit
 * @returns {Promise<[number, number]>} [X resolution (m/pixel), Y resolution (m/pixel)]
 */
export async function calculateResolution(
  input: { image?: string; bbox: BBox; width: number; height: number },
  unit?: Unit
): Promise<[number, number]> {
  // Convert bbox from EPSG:4326 to EPSG:3857
  const [minX, minY]: Point = lonLat4326ToXY3857(input.bbox[0], input.bbox[1]);
  const [maxX, maxY]: Point = lonLat4326ToXY3857(input.bbox[2], input.bbox[3]);

  let resolution: [number, number];

  // Get origin image size
  if (input.image) {
    const { width, height }: HTMLImageElement = await loadImageSrc(input.image);

    resolution = [(maxX - minX) / width, (maxY - minY) / height];
  } else {
    resolution = [(maxX - minX) / input.width, (maxY - minY) / input.height];
  }

  // Convert resolution to the specified unit
  return [
    convertLength(resolution[0], "m", unit),
    convertLength(resolution[1], "m", unit),
  ];
}
