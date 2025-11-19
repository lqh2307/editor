import Ajv from "ajv";

/**
 * Check value is valid number?
 * @param {any} value Value
 * @param {boolean} checkInteger Check is integer?
 * @param {number} min Min
 * @param {number} max Max
 * @return {boolean}
 */
export function isValidNumber(
  value: any,
  checkInteger?: boolean,
  min?: number,
  max?: number
): boolean {
  if (typeof value !== "number" || Number.isFinite(value) === false) {
    return false;
  }

  if (checkInteger === true && Number.isInteger(value) === false) {
    return false;
  }

  if (min !== undefined && value < min) {
    return false;
  }

  if (max !== undefined && value > max) {
    return false;
  }

  return true;
}

/**
 * Check value is valid longitude?
 * @param {any} lon Longitude
 * @param {boolean} isWGS84 use WGS84?
 * @return {boolean}
 */
export function isValidLongitude(lon: any, isWGS84?: boolean): boolean {
  return isWGS84 === true
    ? isValidNumber(lon, false, -180, 180)
    : isValidNumber(lon, false);
}

/**
 * Check value is valid latitude?
 * @param {any} lat Latitude
 * @param {boolean} isWGS84 use WGS84?
 * @return {boolean}
 */
export function isValidLatitude(lat: any, isWGS84?: boolean): boolean {
  return isWGS84 === true
    ? isValidNumber(lat, false, -90, 90)
    : isValidNumber(lat, false);
}

/**
 * Check value is valid extent?
 * @param {any} extent Extent
 * @param {boolean} isWGS84 use WGS84?
 * @return {boolean}
 */
export function isValidExtent(extent: any, isWGS84?: boolean): boolean {
  if (Array.isArray(extent) === false) {
    return false;
  }

  if (extent.length !== 4) {
    return false;
  }

  if (
    isValidLongitude(extent[0], isWGS84) === false ||
    isValidLongitude(extent[2], isWGS84) === false
  ) {
    return false;
  }

  if (
    isValidLatitude(extent[1], isWGS84) === false ||
    isValidLatitude(extent[3], isWGS84) === false
  ) {
    return false;
  }

  if (extent[0] >= extent[2] || extent[1] <= extent[3]) {
    return false;
  }

  return true;
}

/**
 * Check value is valid bbox?
 * @param {any} bbox BBox
 * @param {boolean} isWGS84 use WGS84?
 * @return {boolean}
 */
export function isValidBBox(bbox: any, isWGS84?: boolean): boolean {
  if (Array.isArray(bbox) === false) {
    return false;
  }

  if (bbox.length !== 4) {
    return false;
  }

  if (
    isValidLongitude(bbox[0], isWGS84) === false ||
    isValidLongitude(bbox[2], isWGS84) === false
  ) {
    return false;
  }

  if (
    isValidLatitude(bbox[1], isWGS84) === false ||
    isValidLatitude(bbox[3], isWGS84) === false
  ) {
    return false;
  }

  if (bbox[0] >= bbox[2] || bbox[1] >= bbox[3]) {
    return false;
  }

  return true;
}

/**
 * Check value is valid zoom?
 * @param {any} zoom BBox
 * @return {boolean}
 */
export function isValidZoom(zoom: any): boolean {
  return isValidNumber(zoom, false, 0, 25);
}

/**
 * Validate JSON
 * @param {object} schema JSON schema
 * @param {object} jsonData JSON data
 * @returns {void}
 */
export function validateJSON(schema: object, jsonData: object): void {
  try {
    const validate = new Ajv({
      allErrors: true,
    }).compile(schema);

    if (!validate(jsonData)) {
      throw validate.errors
        .map((error) => `\n\t${error.instancePath} ${error.message}`)
        .join();
    }
  } catch (error) {
    throw error;
  }
}
