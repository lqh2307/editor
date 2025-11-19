import { DDMMSS, Format, Unit } from "../../types/Common";
import { WindowSize } from "../../types/Window";
import { Mutex } from "async-mutex";
import mime from "mime";

/**
 * Delay function to wait for a specified time
 * @param {number} ms Time to wait in millisecond
 * @returns {Promise<void>}
 */
export async function delay(ms: number): Promise<void> {
  if (ms >= 0) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Get content-type from format
 * @param {Format} format Data format
 * @returns {string} Content type
 */
export function detectContentTypeFromFormat(format: Format): string {
  return mime.getType(format);
}

/**
 * Handle concurrency
 * @param {number} concurrency Concurrency
 * @param {(idx: number, value: any[], tasks: { activeTasks: number, completeTasks: number }) => void} handleFunc Handle function
 * @param {any[]} values Values
 * @param {{ interval: number, callbackFunc: (tasks: { activeTasks: number, completeTasks: number }) => void }} callback Callback
 * @returns {Promise<{void}>} Response
 */
export async function handleConcurrency(
  concurrency: number,
  handleFunc: (
    idx: number,
    value: any[],
    tasks: { activeTasks: number; completeTasks: number }
  ) => Promise<void>,
  values: any[],
  callback: {
    interval: number;
    callbackFunc: (tasks: {
      activeTasks: number;
      completeTasks: number;
    }) => void;
  }
): Promise<void> {
  let intervalID: NodeJS.Timeout;

  try {
    const mutex: Mutex = new Mutex();

    const tasks = {
      activeTasks: 0,
      completeTasks: 0,
    };

    const { interval, callbackFunc } = callback || {};

    /* Call callback */
    if (interval > 0 && callbackFunc) {
      intervalID = setInterval(() => callbackFunc(tasks), interval);
    }

    for (let idx = 0; idx < values.length; idx++) {
      /* Wait slot for a task */
      while (tasks.activeTasks >= concurrency) {
        await delay(25);
      }

      /* Acquire mutex */
      await mutex.runExclusive(() => {
        tasks.activeTasks++;
        tasks.completeTasks++;
      });

      /* Run a task */
      handleFunc(idx, values, tasks).finally(() =>
        /* Release mutex */
        mutex.runExclusive(() => {
          tasks.activeTasks--;
        })
      );
    }

    /* Wait all tasks done */
    while (tasks.activeTasks > 0) {
      await delay(25);
    }

    /* Last call callback */
    if (interval > 0 && callbackFunc) {
      callbackFunc(tasks);
    }
  } catch (error) {
    throw error;
  } finally {
    if (intervalID) {
      clearInterval(intervalID);
    }
  }
}

/**
 * Create base64 string from buffer
 * @param {Buffer} buffer Input data
 * @param {Format} format Data format
 * @returns {string} Base64 string
 */
export function createBase64(buffer: Buffer, format: Format): string {
  return `data:${detectContentTypeFromFormat(format)};base64,${buffer?.toString("base64")}`;
}

/**
 * Save file from bufer
 * @param {BlobPart} buffer Input data
 * @param {string} fileName File name
 * @param {string} mimeType Mime type
 * @returns {void}
 */
export function saveFileFromBuffer(
  buffer: BlobPart,
  fileName: string,
  mimeType?: string
): void {
  mimeType = mimeType || "application/octet-stream";

  const a: HTMLAnchorElement = document.createElement("a");

  const url: string = URL.createObjectURL(
    new Blob([buffer], { type: mimeType })
  );

  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Save file from base64 string
 * @param {string} base64 Base64 string
 * @param {string} fileName File name
 * @param {string} mimeType Mime type
 * @returns {void}
 */
export function saveFileFromBase64(
  base64: string,
  fileName: string,
  mimeType?: string
): void {
  const matches: RegExpMatchArray = base64?.match(/^data:(.+);base64,(.+)$/);
  mimeType = mimeType || "application/octet-stream";

  if (!matches) {
    base64 = `data:${mimeType};base64,${base64}`;
  }

  const a: HTMLAnchorElement = document.createElement("a");
  a.href = base64;
  a.download = fileName;
  a.click();
}

export function degToRad(angle: number): number {
  return (angle / 180) * Math.PI;
}

export function radToDeg(angle: number): number {
  return (180 * angle) / Math.PI;
}

export function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((word) =>
      word.length > 0 ? word[0].toUpperCase() + word.slice(1) : ""
    )
    .join(" ");
}

export function calculatePaperSize(paperType: string): WindowSize {
  const match: RegExpMatchArray = paperType
    ?.toLowerCase()
    .match(/^([abc])(\d+)$/);
  if (!match) {
    return;
  }

  let width0: number;
  let height0: number;

  switch (match[1]) {
    case "a": {
      width0 = 841;
      height0 = 1189;

      break;
    }

    case "b": {
      width0 = 1000;
      height0 = 1414;

      break;
    }

    case "c": {
      width0 = 917;
      height0 = 1297;

      break;
    }

    default: {
      return;
    }
  }

  let width = width0;
  let height = height0;

  for (let i = 0; i < Number(match[2]); i++) {
    const newWidth: number = Math.floor(height / 2);

    height = width;
    width = newWidth;
  }

  return { width, height };
}

export function normalize180(deg: number): number {
  let d: number = deg % 360;
  if (d > 180) {
    d -= 360;
  } else if (d < -180) {
    d += 360;
  }

  return d;
}

/**
 * Convert degree to degree, mins, second
 * @param {number} deg
 * @return {DDMMSS}
 */
export function convertDEGToDMS(deg: number): DDMMSS {
  const normalized: number = normalize180(deg % 360);

  const absolute: number = Math.abs(normalized);
  let degree: number = Math.floor(absolute);
  const minuteNotTruncated: number = (absolute - degree) * 60;
  let minute: number = Math.floor(minuteNotTruncated);
  let second: number = Math.round((minuteNotTruncated - minute) * 60);

  if (second === 60) {
    minute += 1;

    second = 0;
  }

  if (minute === 60) {
    degree += 1;

    minute = 0;
  }

  return {
    degree: normalized >= 0 ? degree : -degree,
    minute: minute,
    second: second,
  };
}

/**
 * Convert degree to degree, mins, second string
 * @param {number} deg
 * @return {string}
 */
export function convertDEGToDMSString(deg: number): string {
  const normalized: number = normalize180(deg % 360);

  const absolute: number = Math.abs(normalized);
  let degree: number = Math.floor(absolute);
  const minuteNotTruncated: number = (absolute - degree) * 60;
  let minute: number = Math.floor(minuteNotTruncated);
  let second: number = Math.round((minuteNotTruncated - minute) * 60);

  if (second === 60) {
    minute += 1;

    second = 0;
  }

  if (minute === 60) {
    degree += 1;

    minute = 0;
  }

  return `${normalized >= 0 ? degree : -degree}° ${minute}' ${second}"`;
}

/**
 * Convert degree, mins, second to degree
 * @param {DDMMSS} dms
 * @return {number}
 */
export function convertDMSToDEG(dms: DDMMSS): number {
  const absDeg: number = Math.abs(dms.degree);
  const decimal: number = absDeg + dms.minute / 60 + dms.second / 3600;
  const signed: number = dms.degree >= 0 ? decimal : -decimal;

  return normalize180(signed % 360);
}

export function isSafari(): boolean {
  const ua: string = navigator.userAgent.toLowerCase();

  return (
    ua.includes("safari") &&
    !ua.includes("chrome") &&
    !ua.includes("crios") &&
    !ua.includes("fxios")
  );
}

/**
 * Convert a value from one unit to another
 * @param {number} value Numeric value
 * @param {Unit} from Unit of input value (Default: "m")
 * @param {Unit} to Unit of output value (Default: "m")
 * @returns {number} Converted value
 */
export function convertLength(value: number, from: Unit, to: Unit): number {
  const factors: Record<string, number> = {
    km: 1000,
    hm: 100,
    dam: 10,
    m: 1,
    dm: 0.1,
    cm: 0.01,
    mm: 0.001,
  };

  return (
    (value * (factors[from] ?? factors["m"])) / (factors[to] ?? factors["m"])
  );
}

/**
 * Convert a value with unit to pixels
 * @param {number} value Mumeric value
 * @param {Unit} unit Unit of the value (Default: m)
 * @param {number} ppi Pixel per inch
 * @returns {number} Value in pixel
 */
export function toPixel(value: number, unit: Unit, ppi: number): number {
  const factors: Record<string, number> = {
    km: 1000,
    hm: 100,
    dam: 10,
    m: 1,
    dm: 0.1,
    cm: 0.01,
    mm: 0.001,
  };

  return (value * (ppi ?? 96) * (factors[unit] ?? factors["m"])) / 0.0254;
}

/**
 * Convert pixels to a value with unit
 * @param {number} pixels Value in pixel
 * @param {Unit} unit Target unit (Default: m)
 * @param {number} ppi Pixel per inch
 * @returns {number} Value in the given unit
 */
export function fromPixel(pixels: number, unit: Unit, ppi: number): number {
  const factors: Record<string, number> = {
    km: 1000,
    hm: 100,
    dam: 10,
    m: 1,
    dm: 0.1,
    cm: 0.01,
    mm: 0.001,
  };

  return (pixels * 0.0254) / ((ppi ?? 96) * (factors[unit] ?? factors["m"]));
}
