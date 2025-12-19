// Tính toán lat/lon từ vị trí chuột, thông tin background và calibration
export function calculateLatLonFromPointer(pointer, bgNode, calibration) {
  if (!pointer || !bgNode || !calibration?.topRight || !calibration?.bottomLeft)
    return undefined;
  const bx = bgNode.x();
  const by = bgNode.y();
  const bw = bgNode.width();
  const bh = bgNode.height();
  const relX = pointer.x - bx;
  const relY = pointer.y - by;
  if (relX < 0 || relY < 0 || relX > bw || relY > bh) return undefined;
  const lon =
    calibration.bottomLeft.lon +
    (relX / bw) * (calibration.topRight.lon - calibration.bottomLeft.lon);
  const lat =
    calibration.topRight.lat +
    (relY / bh) * (calibration.bottomLeft.lat - calibration.topRight.lat);
  return { lat, lon };
}
