import { detectContentTypeFromFormat } from "../Utils";
import axios, { AxiosResponse } from "axios";
import { Format } from "../../types/Common";

/**
 * Convert string data to blob
 * @param str
 * @param format
 * @returns
 */
export function stringToBlob(str: string, format?: Format): Blob {
  return new Blob([str], {
    type: detectContentTypeFromFormat(format),
  });
}

/**
 * Convert base64 to blob
 * @param str
 * @param format
 * @returns
 */
export function base64ToBlob(base64: string, format?: Format): Blob {
  const matches: RegExpMatchArray = base64.match(/^data:(.+);base64,(.+)$/);
  let mimeType: string = detectContentTypeFromFormat(format);

  if (matches) {
    mimeType = matches[1];
    base64 = matches[2];
  }

  const binaryString: string = atob(base64);
  const len: number = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new Blob([bytes.buffer], {
    type: mimeType,
  });
}

/**
 * Convert blob to base64
 * @param blob
 * @returns
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader: FileReader = new FileReader();

    reader.onabort = (err) => reject(err);
    reader.onerror = (err) => reject(err);
    reader.onload = () => resolve(reader.result as string);

    reader.readAsDataURL(blob);
  });
}

/**
 * Convert string data to base64
 * @param str
 * @param format
 * @returns
 */
export async function stringToBase64(
  str: string,
  format?: Format
): Promise<string> {
  return await blobToBase64(
    new Blob([str], {
      type: detectContentTypeFromFormat(format),
    })
  );
}

/**
 * Convert URL to base64 or object URL
 * @param url
 * @param objectURL
 * @returns
 */
export async function urlToBase64OrObjectURL(
  url: string,
  objectURL?: boolean
): Promise<string> {
  const response: AxiosResponse = await axios.get(url, {
    responseType: "blob",
  });

  if (objectURL) {
    return URL.createObjectURL(response.data);
  } else {
    return await new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();

      reader.onabort = (err) => reject(err);
      reader.onerror = (err) => reject(err);
      reader.onload = () => resolve(reader.result as string);

      reader.readAsDataURL(response.data);
    });
  }
}

/**
 * Convert blob to string data
 * @param blob
 * @returns
 */
export async function blobToString(blob: Blob): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader: FileReader = new FileReader();

    reader.onabort = (err) => reject(err);
    reader.onerror = (err) => reject(err);
    reader.onload = () => resolve(reader.result as string);

    reader.readAsText(blob);
  });
}

/**
 * Convert blob to object URL
 * @param blob
 * @returns
 */
export function blobToObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Convert base64 to object URL
 * @param base64
 * @param format
 * @returns
 */
export function base64ToObjectURL(base64: string, format?: Format): string {
  const blob: Blob = base64ToBlob(base64, format);

  return URL.createObjectURL(blob);
}

/**
 * Revoke object URL
 * @param objectUrl
 */
export function revokeObjectURL(objectUrl: string): void {
  URL.revokeObjectURL(objectUrl);
}

/**
 * Load image
 * @param src
 * @returns
 */
export async function loadImageSrc(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img: HTMLImageElement = new Image();

    img.onload = () => resolve(img);

    img.onabort = reject;
    img.onerror = reject;

    img.src = src;
  });
}

/**
 * Load image from object URL or base64
 * @param url
 * @param base64
 * @returns
 */
export async function loadImage(
  url: string,
  base64?: boolean
): Promise<HTMLImageElement> {
  const src: string = base64
    ? base64ToObjectURL(url)
    : await urlToBase64OrObjectURL(url, true);

  return await loadImageSrc(src);
}

/**
 * Load image from blob
 * @param url
 * @param base64
 * @returns
 */
export async function loadImageBlob(blob: Blob): Promise<HTMLImageElement> {
  const src: string = blobToObjectURL(blob);

  return await loadImageSrc(src);
}

/**
 * Load video
 * @param src
 * @returns
 */
export async function loadVideoSrc(src: string): Promise<HTMLVideoElement> {
  return await new Promise((resolve, reject) => {
    const video: HTMLVideoElement = document.createElement("video");

    video.src = src;
    video.preload = "metadata";
    video.autoplay = false;
    video.crossOrigin = "anonymous";

    video.onloadedmetadata = () => resolve(video);
    video.onerror = (err) => reject(err);
    video.onabort = (err) => reject(err);
  });
}

/**
 * Load video from object URL or base64
 * @param url
 * @param base64
 * @returns
 */
export async function loadVideo(
  url: string,
  base64?: boolean
): Promise<HTMLVideoElement> {
  const src: string = base64
    ? base64ToObjectURL(url)
    : await urlToBase64OrObjectURL(url, true);

  return await loadVideoSrc(src);
}

/**
 * Load video from blob
 * @param url
 * @param base64
 * @returns
 */
export async function loadVideoBlob(blob: Blob): Promise<HTMLVideoElement> {
  const src: string = blobToObjectURL(blob);

  return await loadVideoSrc(src);
}

/**
 * Convert string data to base64 or object URL
 * @param str
 * @param options
 * @returns
 */
export async function stringToBase64OrObjectURL(
  str: string,
  options: {
    fromFormat: Format;
    toFormat?: Format;
    width?: number;
    height?: number;
    objectURL?: boolean;
  }
): Promise<string> {
  const base64Image: string = await stringToBase64(str, options.fromFormat);
  const image: HTMLImageElement = await loadImageSrc(base64Image);

  const canvas: HTMLCanvasElement = document.createElement("canvas");
  if (options.width && options.height) {
    canvas.width = options.width;
    canvas.height = options.height;
  } else if (options.width) {
    canvas.width = options.width;
    canvas.height = options.width * (image.height / image.width);
  } else if (options.height) {
    canvas.width = options.height * (image.width / image.height);
    canvas.height = options.height;
  } else {
    canvas.width = image.width;
    canvas.height = image.height;
  }
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

  const base64: string = canvas.toDataURL(
    detectContentTypeFromFormat(options.toFormat)
  );

  if (options.objectURL) {
    return base64ToObjectURL(base64, options.toFormat);
  } else {
    return base64;
  }
}
