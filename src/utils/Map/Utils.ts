// Kiểu tọa độ
export interface LatLon {
  lat: number;
  lon: number;
}

// Kiểu calibration
export interface Calibration {
  topRight: LatLon;
  bottomLeft: LatLon;
}

// Kiểu pointer (chuột)
export interface PointerPosition {
  x: number;
  y: number;
}

// Kiểu bgNode (Konva Node tối thiểu cần dùng)
export interface BgNode {
  x(): number;
  y(): number;
  width(): number;
  height(): number;
}

// Hàm tính lat/lon từ vị trí chuột
export function calculateLatLonFromPointer(
  pointer: PointerPosition | null | undefined,
  bgNode: BgNode | null | undefined,
  calibration: Calibration | null | undefined
): LatLon | undefined {
  if (
    !pointer ||
    !bgNode ||
    !calibration?.topRight ||
    !calibration?.bottomLeft
  ) {
    return undefined;
  }

  const bx = bgNode.x();
  const by = bgNode.y();
  const bw = bgNode.width();
  const bh = bgNode.height();

  const relX = pointer.x - bx;
  const relY = pointer.y - by;

  // Chuột nằm ngoài ảnh
  if (relX < 0 || relY < 0 || relX > bw || relY > bh) {
    return undefined;
  }

  const lon =
    calibration.bottomLeft.lon +
    (relX / bw) *
    (calibration.topRight.lon - calibration.bottomLeft.lon);

  const lat =
    calibration.topRight.lat +
    (relY / bh) *
    (calibration.bottomLeft.lat - calibration.topRight.lat);

  return { lat, lon };
}

// Convert a lat/lon to canvas pixel coordinates using calibration and background node
export function calculatePointerFromLatLon(
  latlon: LatLon | null | undefined,
  bgNode: BgNode | null | undefined,
  calibration: Calibration | null | undefined
): PointerPosition | undefined {
  if (!latlon || !bgNode || !calibration?.topRight || !calibration?.bottomLeft) {
    return undefined;
  }

  const bx = bgNode.x();
  const by = bgNode.y();
  const bw = bgNode.width();
  const bh = bgNode.height();

  const lonMin = calibration.bottomLeft.lon;
  const lonMax = calibration.topRight.lon;
  const latMin = calibration.bottomLeft.lat;
  const latMax = calibration.topRight.lat;

  if (
    lonMax === lonMin ||
    latMax === latMin ||
    latlon.lon < Math.min(lonMin, lonMax) ||
    latlon.lon > Math.max(lonMin, lonMax) ||
    latlon.lat < Math.min(latMin, latMax) ||
    latlon.lat > Math.max(latMin, latMax)
  ) {
    // Outside calibrated extent -> skip
    return undefined;
  }

  // Map lon across width, lat across height (top decreases)
  const relX = ((latlon.lon - lonMin) / (lonMax - lonMin)) * bw;
  const relY = ((latlon.lat - latMax) / (latMin - latMax)) * bh; // top is latMax

  return { x: bx + relX, y: by + relY };
}

// Convert an array of lat/lon positions to Konva polyline points [x1,y1,x2,y2,...]
export function latLonHistoryToPoints(
  history: LatLon[] | null | undefined,
  bgNode: BgNode | null | undefined,
  calibration: Calibration | null | undefined
): number[] {
  if (!history?.length) return [];

  const pts: number[] = [];
  for (const h of history) {
    const p = calculatePointerFromLatLon(h, bgNode, calibration);
    if (p) {
      pts.push(p.x, p.y);
    }
  }
  return pts;
}
