/**
 * Limit value
 * @param {number} value Value
 * @param {number} min Min
 * @param {number} max Max
 * @returns {number}
 */
export function limitValue(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) {
    value = min;
  }

  if (max !== undefined && value > max) {
    value = max;
  }

  return value;
}

/**
 * Max value
 * @param {number[]} values Values
 * @returns {number}
 */
export function maxValue(values: number[]): number {
  if (values?.length) {
    let value: number = values[0];

    for (let i = 1; i < values.length; i++) {
      if (value < values[i]) {
        value = values[i];
      }
    }

    return value;
  }
}

/**
 * Min value
 * @param {number[]} values Values
 * @returns {number}
 */
export function minValue(values: number[]): number {
  if (values?.length) {
    let value: number = values[0];

    for (let i = 1; i < values.length; i++) {
      if (value > values[i]) {
        value = values[i];
      }
    }

    return value;
  }
}

/**
 * Fix number
 * @param {string} strNumber
 * @param {boolean} isFloat
 * @param {number} defaultNumber
 * @returns {number}
 */
export function fixNumber(
  strNumber: string,
  isFloat?: boolean,
  defaultNumber?: number
): number {
  const match: RegExpMatchArray = strNumber?.match(
    isFloat ? /-?\d+(\.\d+)?/ : /-?\d+/
  );

  return match ? Number(match[0]) : (defaultNumber ?? 0);
}
