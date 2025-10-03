import { BBox, ImageFormat, TileSize } from "../../types/Common";
import { detectContentTypeFromFormat } from "../Utils";
import { WindowSize } from "../../types/Window";
import { calculateSizes } from "../Spatial";
import maplibregl from "maplibre-gl";

export async function renderMap(option: {
  style: any;
  bounds: BBox;
  zoom: number;
  tileScale?: number;
  tileSize?: TileSize;
  pitch?: number;
  bearing?: number;
  format?: ImageFormat;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const size: WindowSize = calculateSizes(
      option.zoom,
      option.bounds,
      option.tileScale,
      option.tileSize
    );

    const container: HTMLDivElement = document.createElement("div");
    container.style.position = "relative";
    container.style.left = size.width + "px";
    container.style.top = size.height + "px";
    container.style.width = size.width + "px";
    container.style.height = size.height + "px";
    document.body.appendChild(container);

    const map: maplibregl.Map = new maplibregl.Map({
      container: container,
      style: option.style,
      bounds: option.bounds,
      zoom: option.zoom,
      pitch: option.pitch ?? 0,
      bearing: option.bearing ?? 0,
    });

    map.on("error", (error) => {
      map.remove();
      container.remove();

      reject(error);
    });

    map.once("idle", () => {
      const dataURL: string = map
        .getCanvas()
        .toDataURL(detectContentTypeFromFormat(option.format ?? "png"));

      map.remove();
      container.remove();

      resolve(dataURL);
    });
  });
}
