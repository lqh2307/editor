import { Color } from "../../types/Color";
import { clampNumber } from "../Utils";

export function parseRGBAStringToRGBA(color: string): Color {
  const match: RegExpMatchArray = color?.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
  );

  if (!match) {
    return;
  }

  const r: number =
    match[1] === undefined ? undefined : clampNumber(Number(match[1]), 0, 255);
  const g: number =
    match[2] === undefined ? undefined : clampNumber(Number(match[2]), 0, 255);
  const b: number =
    match[3] === undefined ? undefined : clampNumber(Number(match[3]), 0, 255);
  const a: number =
    match[4] === undefined ? undefined : clampNumber(Number(match[4]), 0, 1);

  return { r, g, b, a };
}

export function parseHexToRGB(hex: string): Color {
  const match: RegExpMatchArray = hex?.match(/^#([a-f\d]{3}|[a-f\d]{6})$/i);

  if (!match) return;

  if (match[1].length === 3) {
    match[1] = `${match[1][0]}${match[1][0]}${match[1][1]}${match[1][1]}${match[1][2]}${match[1][2]}`;
  }

  const bigint: number = parseInt(match[1], 16);
  const r: number = (bigint >> 16) & 255;
  const g: number = (bigint >> 8) & 255;
  const b: number = bigint & 255;

  return { r, g, b };
}

export function parseHexToRGBAString(hex: string, alpha?: number): string {
  const match: RegExpMatchArray = hex?.match(/^#([a-f\d]{3}|[a-f\d]{6})$/i);

  if (!match) {
    return "rgb(0,0,0)";
  }

  if (match[1].length === 3) {
    match[1] = `${match[1][0]}${match[1][0]}${match[1][1]}${match[1][1]}${match[1][2]}${match[1][2]}`;
  }

  const bigint: number = parseInt(match[1], 16);
  const r: number = (bigint >> 16) & 255;
  const g: number = (bigint >> 8) & 255;
  const b: number = bigint & 255;

  return alpha === undefined
    ? `rgb(${r},${g},${b})`
    : `rgba(${r},${g},${b},${alpha})`;
}

export function parseRGBAStringToHex(color: string): string {
  const match: RegExpMatchArray = color?.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
  );

  if (!match) {
    return "#000000";
  }

  const r: string =
    match[1] === undefined
      ? "00"
      : clampNumber(Number(match[1]), 0, 255).toString(16).padStart(2, "0");
  const g: string =
    match[2] === undefined
      ? "00"
      : clampNumber(Number(match[2]), 0, 255).toString(16).padStart(2, "0");
  const b: string =
    match[3] === undefined
      ? "00"
      : clampNumber(Number(match[3]), 0, 255).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
}

export function rgbaToRGBAString(color: Color): string {
  if (!color) {
    return "rgb(0,0,0)";
  }

  return color.a === undefined
    ? `rgb(${color.r},${color.g},${color.b})`
    : `rgba(${color.r},${color.g},${color.b},${color.a})`;
}

/**
 * Create random hex color
 * @returns {string}
 */
export function createRandomHexColor(): string {
  const r: string = Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, "0");
  const g: string = Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, "0");
  const b: string = Math.floor(Math.random() * 256)
    .toString(16)
    .padStart(2, "0");

  return `#${r}${g}${b}`;
}

/**
 * Create random RGBA string color
 * @returns {string}
 */
export function createRandomRGBAStringColor(): string {
  const r: number = Math.floor(Math.random() * 256);
  const g: number = Math.floor(Math.random() * 256);
  const b: number = Math.floor(Math.random() * 256);
  const a: number = Math.random();

  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Create random RGBA string color
 * @returns {Color}
 */
export function createRandomRGBAString(): Color {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
    a: Math.random(),
  };
}
