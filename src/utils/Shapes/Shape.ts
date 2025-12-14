import { WindowRect, WindowSize } from "../../types/Window";
import { KonvaLineStyle } from "../../types/Konva";
import { IRect, Vector2d } from "konva/lib/types";
import { createRandomHexColor } from "../Color";
import { Filter } from "konva/lib/Node";
import { nanoid } from "nanoid";
import svgPath from "svgpath";
import Konva from "konva";
import {
  KonvaFreeDrawingLine,
  KonvaShapeBox,
  KonvaShape,
} from "../../components/KonvaShape";

/**
 * Create shape config
 * @param shape
 * @returns
 */
export function createShape(shape: KonvaShape): KonvaShape {
  const randomColor: string = createRandomHexColor();

  const newShape = {
    ...shape,
  };

  // Asign id
  newShape.id = newShape.id ?? nanoid();

  // Draggable
  newShape.draggable = newShape.draggable ?? true;

  // Color
  newShape.opacity = newShape.opacity ?? 1;
  newShape.strokeScaleEnabled = newShape.strokeScaleEnabled ?? false;
  newShape.shadowEnabled = newShape.shadowEnabled ?? false;
  newShape.shadowColor = newShape.shadowColor ?? "#000000";
  newShape.shadowOpacity = newShape.shadowOpacity ?? 0.5;
  newShape.shadowBlur = newShape.shadowBlur ?? 0;
  newShape.shadowOffsetX = newShape.shadowOffsetX ?? 0;
  newShape.shadowOffsetY = newShape.shadowOffsetY ?? 15;
  newShape.rotation = newShape.rotation ?? 0;

  // Skew
  newShape.skewX = newShape.skewX ?? 0;
  newShape.skewY = newShape.skewY ?? 0;

  // Scale
  newShape.scaleX = newShape.scaleX ?? 1;
  newShape.scaleY = newShape.scaleY ?? 1;

  // Line style
  newShape.lineStyle = newShape.lineStyle ?? "solid";

  // Assign attrs
  switch (newShape.type) {
    default: {
      break;
    }

    case "arrow":
    case "line": {
      // Size
      if (newShape.type === "arrow") {
        newShape.pointerWidth =
          newShape.pointerWidth ?? newShape.pointerWidth ?? 10;
        newShape.pointerLength =
          newShape.pointerLength ?? newShape.pointerLength ?? 10;
      }

      // Common
      newShape.x = newShape.x ?? 150;
      newShape.y = newShape.y ?? 250;
      newShape.fillEnabled = newShape.fillEnabled ?? true;
      newShape.fill = newShape.fill ?? randomColor;
      newShape.fillOpacity = newShape.fillOpacity ?? 1;
      newShape.lineCap = newShape.lineCap ?? "butt";
      newShape.lineJoin = newShape.lineJoin ?? "miter";
      newShape.strokeEnabled = newShape.strokeEnabled ?? true;
      newShape.stroke = newShape.stroke ?? randomColor;
      newShape.strokeOpacity = newShape.strokeOpacity ?? 1;
      newShape.strokeScaleEnabled = newShape.strokeScaleEnabled ?? false;
      newShape.strokeWidth = newShape.strokeWidth ?? 10;
      newShape.points = newShape.points ?? [0, 0, 200, 0];

      // Offset
      newShape.offsetX = newShape.offsetX ?? 100;
      newShape.offsetY = newShape.offsetY ?? 0;

      break;
    }

    case "rectangle": {
      // Common
      newShape.width = newShape.width ?? 200;
      newShape.height = newShape.height ?? 200;
      newShape.x = newShape.x ?? 150;
      newShape.y = newShape.y ?? 150;
      newShape.fillEnabled = newShape.fillEnabled ?? true;
      newShape.fill = newShape.fill ?? randomColor;
      newShape.fillOpacity = newShape.fillOpacity ?? 1;
      newShape.lineCap = newShape.lineCap ?? "butt";
      newShape.lineJoin = newShape.lineJoin ?? "miter";
      newShape.strokeEnabled = newShape.strokeEnabled ?? true;
      newShape.stroke = newShape.stroke ?? "#000000";
      newShape.strokeOpacity = newShape.strokeOpacity ?? 1;
      newShape.strokeWidth = newShape.strokeWidth ?? 1;
      newShape.cornerRadius = newShape.cornerRadius ?? 0;

      // Offset
      newShape.offsetX = newShape.offsetX ?? newShape.width / 2;
      newShape.offsetY = newShape.offsetY ?? newShape.height / 2;

      break;
    }

    case "ellipse":
    case "circle":
    case "convex-polygon":
    case "concave-polygon":
    case "ring":
    case "wedge": {
      // Size
      if (newShape.type === "ellipse") {
        newShape.radiusX = newShape.radiusX ?? 100;
        newShape.radiusY = newShape.radiusY ?? 100;
      } else if (newShape.type === "circle") {
        newShape.radius = newShape.radius ?? 100;
      } else if (newShape.type === "convex-polygon") {
        newShape.sides = 5;
        newShape.radius = newShape.radius ?? 100;
      } else if (newShape.type === "concave-polygon") {
        newShape.numPoints = 5;
        newShape.innerRadius = newShape.innerRadius ?? 40;
        newShape.outerRadius = newShape.outerRadius ?? 100;
      } else if (newShape.type === "ring") {
        newShape.innerRadius = newShape.innerRadius ?? 40;
        newShape.outerRadius = newShape.outerRadius ?? 100;
      } else {
        newShape.radius = newShape.radius ?? 100;
        newShape.angle = newShape.angle ?? 60;
        newShape.clockwise = newShape.clockwise ?? false;
      }

      // Common
      newShape.x = newShape.x ?? 250;
      newShape.y = newShape.y ?? 250;
      newShape.fillEnabled = newShape.fillEnabled ?? true;
      newShape.fill = newShape.fill ?? randomColor;
      newShape.fillOpacity = newShape.fillOpacity ?? 1;
      newShape.lineCap = newShape.lineCap ?? "butt";
      newShape.lineJoin = newShape.lineJoin ?? "miter";
      newShape.strokeEnabled = newShape.strokeEnabled ?? true;
      newShape.stroke = newShape.stroke ?? "#000000";
      newShape.strokeOpacity = newShape.strokeOpacity ?? 1;
      newShape.strokeWidth = newShape.strokeWidth ?? 1;

      // Offset
      newShape.offsetX = newShape.offsetX ?? 0;
      newShape.offsetY = newShape.offsetY ?? 0;

      break;
    }

    case "text": {
      // Common
      newShape.width = newShape.width ?? 200;
      newShape.height = newShape.height ?? 100;
      newShape.x = newShape.x ?? 150;
      newShape.y = newShape.y ?? 150;
      newShape.padding = newShape.padding ?? 0;
      newShape.margin = newShape.margin ?? 0;
      newShape.text = newShape.text ?? "Double clicks to edit";
      newShape.textX = newShape.textX ?? 0;
      newShape.textY = newShape.textY ?? 0;
      newShape.textYTextArea = newShape.textYTextArea ?? 0;
      newShape.textXTextArea = newShape.textXTextArea ?? 0;
      newShape.fontFamily = newShape.fontFamily ?? "Arial";
      newShape.lineHeight = newShape.lineHeight ?? 1;
      newShape.fontSize = newShape.fontSize ?? 26;
      newShape.fontStyle = newShape.fontStyle ?? "normal";
      newShape.fontWeight = newShape.fontWeight ?? "normal";
      newShape.fillEnabled = newShape.fillEnabled ?? true;
      newShape.fill = newShape.fill ?? "#000000";
      newShape.fillOpacity = newShape.fillOpacity ?? 1;
      newShape.lineCap = newShape.lineCap ?? "butt";
      newShape.lineJoin = newShape.lineJoin ?? "miter";
      newShape.strokeEnabled = newShape.strokeEnabled ?? false;
      newShape.stroke = newShape.stroke ?? "#000000";
      newShape.strokeOpacity = newShape.strokeOpacity ?? 1;
      newShape.strokeWidth = newShape.strokeWidth ?? 1;
      newShape.align = newShape.align ?? "left";
      newShape.verticalAlign = newShape.verticalAlign ?? "top";
      newShape.wrap = newShape.wrap ?? "word";

      // Offset
      newShape.offsetX = newShape.offsetX ?? newShape.width / 2;
      newShape.offsetY = newShape.offsetY ?? newShape.height / 2;

      break;
    }

    case "free-drawing": {
      // Common
      newShape.x = newShape.x ?? 0;
      newShape.y = newShape.y ?? 0;
      newShape.fillEnabled = newShape.fillEnabled ?? true;
      newShape.fill = newShape.fill ?? "#000000";
      newShape.fillOpacity = newShape.fillOpacity ?? 1;
      newShape.lineCap = newShape.lineCap ?? "round";
      newShape.lineJoin = newShape.lineJoin ?? "round";
      newShape.strokeEnabled = newShape.strokeEnabled ?? true;
      newShape.stroke = newShape.stroke ?? "#000000";
      newShape.strokeOpacity = newShape.strokeOpacity ?? 1;
      newShape.strokeScaleEnabled = newShape.strokeScaleEnabled ?? false;
      newShape.strokeWidth = newShape.strokeWidth ?? 5;
      newShape.tension = newShape.tension ?? 1;
      newShape.lines = newShape.lines ?? [];

      // Offset
      newShape.offsetX = newShape.offsetX ?? 0;
      newShape.offsetY = newShape.offsetY ?? 0;

      break;
    }

    case "multi-line": {
      // Common
      newShape.x = newShape.x ?? 0;
      newShape.y = newShape.y ?? 0;
      newShape.fillEnabled = newShape.fillEnabled ?? true;
      newShape.fill = newShape.fill ?? "#000000";
      newShape.fillOpacity = newShape.fillOpacity ?? 1;
      newShape.lineCap = newShape.lineCap ?? "butt";
      newShape.lineJoin = newShape.lineJoin ?? "miter";
      newShape.strokeEnabled = newShape.strokeEnabled ?? true;
      newShape.stroke = newShape.stroke ?? "#000000";
      newShape.strokeOpacity = newShape.strokeOpacity ?? 1;
      newShape.strokeScaleEnabled = newShape.strokeScaleEnabled ?? false;
      newShape.strokeWidth = newShape.strokeWidth ?? 5;
      newShape.points = newShape.points ?? [];

      // Offset
      newShape.offsetX = newShape.offsetX ?? 0;
      newShape.offsetY = newShape.offsetY ?? 0;

      break;
    }

    case "multi-polygon": {
      // Common
      newShape.x = newShape.x ?? 0;
      newShape.y = newShape.y ?? 0;
      newShape.fillEnabled = newShape.fillEnabled ?? true;
      newShape.fill = newShape.fill ?? "#000000";
      newShape.fillOpacity = newShape.fillOpacity ?? 1;
      newShape.lineCap = newShape.lineCap ?? "butt";
      newShape.lineJoin = newShape.lineJoin ?? "miter";
      newShape.strokeEnabled = newShape.strokeEnabled ?? true;
      newShape.stroke = newShape.stroke ?? "#000000";
      newShape.strokeOpacity = newShape.strokeOpacity ?? 1;
      newShape.strokeScaleEnabled = newShape.strokeScaleEnabled ?? false;
      newShape.strokeWidth = newShape.strokeWidth ?? 5;
      newShape.closed = newShape.closed ?? true;
      newShape.points = newShape.points ?? [];

      // Offset
      newShape.offsetX = newShape.offsetX ?? 0;
      newShape.offsetY = newShape.offsetY ?? 0;

      break;
    }

    case "path": {
      // Common
      newShape.width = newShape.width ?? 200;
      newShape.height = newShape.height ?? 200;
      newShape.x = newShape.x ?? 150;
      newShape.y = newShape.y ?? 150;
      newShape.fillEnabled = newShape.fillEnabled ?? true;
      newShape.fill = newShape.fill ?? "#000000";
      newShape.fillOpacity = newShape.fillOpacity ?? 1;
      newShape.lineCap = newShape.lineCap ?? "butt";
      newShape.lineJoin = newShape.lineJoin ?? "miter";
      newShape.strokeEnabled = newShape.strokeEnabled ?? true;
      newShape.stroke = newShape.stroke ?? "#000000";
      newShape.strokeOpacity = newShape.strokeOpacity ?? 1;
      newShape.strokeWidth = newShape.strokeWidth ?? 1;
      newShape.cornerRadius = newShape.cornerRadius ?? 0;
      newShape.paths = newShape.paths ?? [];

      // Offset
      newShape.offsetX = newShape.offsetX ?? newShape.width / 2;
      newShape.offsetY = newShape.offsetY ?? newShape.height / 2;

      break;
    }

    case "image": {
      // Color filter
      newShape.grayscale = newShape.grayscale ?? false;
      newShape.invert = newShape.invert ?? false;
      newShape.sepia = newShape.sepia ?? false;
      newShape.solarize = newShape.solarize ?? false;

      // General filter
      newShape.pixelSize = newShape.pixelSize ?? 1;
      newShape.brightness = newShape.brightness ?? 0;
      newShape.contrast = newShape.contrast ?? 0;
      newShape.blurRadius = newShape.blurRadius ?? 0;
      newShape.enhance = newShape.enhance ?? 0;
      newShape.noise = newShape.noise ?? 0;

      // Common
      newShape.x = newShape.x ?? 150;
      newShape.y = newShape.y ?? 150;
      newShape.fillEnabled = newShape.fillEnabled ?? true;
      newShape.fill = newShape.fill ?? "#ffffff";
      newShape.fillOpacity = newShape.fillOpacity ?? 0;
      newShape.lineCap = newShape.lineCap ?? "butt";
      newShape.lineJoin = newShape.lineJoin ?? "miter";
      newShape.strokeEnabled = newShape.strokeEnabled ?? false;
      newShape.stroke = newShape.stroke ?? "#000000";
      newShape.strokeOpacity = newShape.strokeOpacity ?? 1;
      newShape.strokeWidth = newShape.strokeWidth ?? 1;
      newShape.cornerRadius = newShape.cornerRadius ?? 0;

      // Size
      if (newShape.image) {
        const img: HTMLImageElement = newShape.image as HTMLImageElement;
        if (img) {
          newShape.width = newShape.width ?? img.width;
          newShape.height = newShape.height ?? img.height;
        }
      }

      // Offset
      newShape.offsetX = newShape.offsetX ?? newShape.width / 2;
      newShape.offsetY = newShape.offsetY ?? newShape.height / 2;

      // Clip
      newShape.clip = newShape.clip ?? {
        width: newShape.width,
        height: newShape.height,
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
      };

      break;
    }

    case "video": {
      // Common
      newShape.x = newShape.x ?? 150;
      newShape.y = newShape.y ?? 150;
      newShape.fillEnabled = newShape.fillEnabled ?? true;
      newShape.fill = newShape.fill ?? "#000000";
      newShape.fillOpacity = newShape.fillOpacity ?? 1;
      newShape.lineCap = newShape.lineCap ?? "butt";
      newShape.lineJoin = newShape.lineJoin ?? "miter";
      newShape.strokeEnabled = newShape.strokeEnabled ?? false;
      newShape.stroke = newShape.stroke ?? "#000000";
      newShape.strokeOpacity = newShape.strokeOpacity ?? 1;
      newShape.strokeWidth = newShape.strokeWidth ?? 1;
      newShape.cornerRadius = newShape.cornerRadius ?? 0;
      newShape.isPlay = newShape.isPlay ?? false;
      newShape.speed = newShape.speed ?? 1;
      newShape.volume = newShape.volume ?? 0.5;
      newShape.loop = newShape.loop ?? false;
      newShape.inverse = newShape.inverse ?? false;

      // Size
      if (newShape.image) {
        const video: HTMLVideoElement = newShape.image as HTMLVideoElement;
        newShape.width = newShape.width ?? video.videoWidth;
        newShape.height = newShape.height ?? video.videoHeight;
      }

      // Offset
      newShape.offsetX = newShape.offsetX ?? newShape.width / 2;
      newShape.offsetY = newShape.offsetY ?? newShape.height / 2;

      break;
    }

    case "quadratic-curve":
    case "bezier-curve": {
      // Common
      newShape.x = newShape.x ?? 150;
      newShape.y = newShape.y ?? 150;
      newShape.fillEnabled = newShape.fillEnabled ?? true;
      newShape.fill = newShape.fill ?? randomColor;
      newShape.fillOpacity = newShape.fillOpacity ?? 1;
      newShape.lineCap = newShape.lineCap ?? "butt";
      newShape.lineJoin = newShape.lineJoin ?? "round";
      newShape.strokeEnabled = newShape.strokeEnabled ?? true;
      newShape.stroke = newShape.stroke ?? randomColor;
      newShape.strokeOpacity = newShape.strokeOpacity ?? 1;
      newShape.strokeScaleEnabled = newShape.strokeScaleEnabled ?? false;
      newShape.strokeWidth = newShape.strokeWidth ?? 5;
      newShape.bezier = newShape.bezier ?? true;

      // Points
      if (newShape.type === "quadratic-curve") {
        newShape.points = newShape.points ?? [0, 0, 200, 0, 200, 0, 200, 200];
      } else {
        newShape.points = newShape.points ?? [
          0, 0, 64.6, 135.4, 135.4, 64.6, 200, 200,
        ];
      }

      // Offset
      newShape.offsetX = newShape.offsetX ?? 0;
      newShape.offsetY = newShape.offsetY ?? 0;

      break;
    }
  }

  return newShape;
}

/**
 * Create shape box
 * @param node
 * @returns
 */
export function createShapeBox(node: Konva.Node): KonvaShapeBox {
  const transform: Konva.Transform = node
    .getStage()
    ?.getAbsoluteTransform()
    .copy()
    .invert();
  if (!transform) {
    return;
  }

  const box: WindowRect = node.getClientRect({
    skipTransform: false,
    skipShadow: false,
    skipStroke: false,
  });

  const topLeft: Vector2d = transform.point({
    x: box.x,
    y: box.y,
  });
  const bottomRight: Vector2d = transform.point({
    x: box.x + box.width,
    y: box.y + box.height,
  });

  return {
    left: topLeft.x,
    top: topLeft.y,
    right: bottomRight.x,
    bottom: bottomRight.y,
    centerX: (topLeft.x + bottomRight.x) / 2,
    centerY: (topLeft.y + bottomRight.y) / 2,
  };
}

/**
 * Calculate group shape box
 * @param shapes
 * @returns
 */
export function calculateGroupShapeBox(shapes: KonvaShape[]): KonvaShapeBox {
  if (shapes.length && shapes[0].box) {
    const box: KonvaShapeBox = {
      ...shapes[0].box,
    };

    for (let i = 1; i < shapes.length; i++) {
      const shapeBox: KonvaShapeBox = shapes[i].box;
      if (!shapeBox) {
        return;
      }

      if (shapeBox.left < box.left) {
        box.left = shapeBox.left;
      }

      if (shapeBox.right > box.right) {
        box.right = shapeBox.right;
      }

      if (shapeBox.top < box.top) {
        box.top = shapeBox.top;
      }

      if (shapeBox.bottom > box.bottom) {
        box.bottom = shapeBox.bottom;
      }
    }

    box.centerX = (box.left + box.right) / 2;
    box.centerY = (box.top + box.bottom) / 2;

    return box;
  }
}

/**
 * Clone lines
 * @param lines
 * @returns
 */
export function cloneLines(
  lines: KonvaFreeDrawingLine[]
): KonvaFreeDrawingLine[] {
  return lines.map((line) => ({
    ...line,
    points: line.points.slice(0),
  }));
}

/**
 * Clone points
 * @param points
 * @returns
 */
export function clonePoints(
  points: number[]
): number[] {
  return points.slice(0);
}

/**
 * Create paths from SVG
 * @param svg
 * @param width
 * @param height
 * @returns
 */
export function createPathsFromSVG(
  svgString: string,
  width?: number,
  height?: number
): Konva.PathConfig[] {
  const result: Konva.PathConfig[] = [];

  const root: Element = new DOMParser().parseFromString(
    svgString,
    "image/svg+xml"
  ).documentElement as Element;

  let scaleX: number = 1;
  let scaleY: number = 1;

  const viewBox: string = root.getAttribute("viewBox");
  if (viewBox) {
    const parts: number[] = viewBox.split(/\s+/).map(Number);

    if (width && parts[2]) {
      scaleX = width / parts[2];
    }

    if (height && parts[3]) {
      scaleY = height / parts[3];
    }
  } else {
    const origWidth: number = Number(root.getAttribute("width") || "0");
    const origHeight: number = Number(root.getAttribute("height") || "0");

    if (width && origWidth) {
      scaleX = width / origWidth;
    }

    if (height && origHeight) {
      scaleY = height / origHeight;
    }
  }

  function traverse(node: Node) {
    if (node.nodeType !== 1) {
      return;
    }

    const el: Element = node as Element;
    let data: string;

    switch (el.tagName) {
      default: {
        break;
      }

      case "rect": {
        const x: string = el.getAttribute("x") || "0";
        const y: string = el.getAttribute("y") || "0";

        const w: number = Number(el.getAttribute("width") || "0");
        const h: number = Number(el.getAttribute("height") || "0");

        let rx: number = Number(el.getAttribute("rx") || "0");
        let ry: number = Number(el.getAttribute("ry") || "0");
        if (!rx && ry) {
          rx = ry;
        }
        if (!ry && rx) {
          ry = rx;
        }

        data = `M${x},${y}m${rx},0l${w - 2 * rx},0q${rx},0 ${rx},${ry}l0,${h - 2 * ry}q0,${ry} ${-rx},${ry}l${-w + 2 * rx},0q${-rx},0 ${-rx},${-ry}l0,${-h + 2 * ry}q0,${-ry} ${rx},${-ry}Z`;

        break;
      }

      case "circle": {
        const cx: string = el.getAttribute("cx") || "0";
        const cy: string = el.getAttribute("cy") || "0";

        const r: number = Number(el.getAttribute("r") || "0");

        data = `M${cx},${cy}m${-r},0a${r},${r},0,1,0,${r * 2},0a${r},${r},0,1,0,${-r * 2},0Z`;

        break;
      }

      case "ellipse": {
        const cx: number = Number(el.getAttribute("cx") || "0");
        const cy: number = Number(el.getAttribute("cy") || "0");

        const rx: number = Number(el.getAttribute("rx") || "0");
        const ry: number = Number(el.getAttribute("ry") || "0");

        data = `M${cx - rx},${cy}a${rx},${ry},0,1,0,${rx * 2},0a${rx},${ry},0,1,0,${-rx * 2},0Z`;

        break;
      }

      case "line": {
        data = `M${el.getAttribute("x1") || "0"},${el.getAttribute("y1") || "0"}L${el.getAttribute("x2") || "0"},${el.getAttribute("y2") || "0"}`;

        break;
      }

      case "polygon": {
        data =
          el
            .getAttribute("points")
            .trim()
            .split(/\s+/)
            .map((p, i) => (i === 0 ? "M" : "L") + p)
            .join("") + "Z";

        break;
      }

      case "path": {
        data = el.getAttribute("d");

        break;
      }
    }

    if (data) {
      result.push({
        data:
          scaleX !== 1 || scaleY !== 1
            ? new svgPath(data).scale(scaleX, scaleY).toString()
            : data,
      });
    }

    el.childNodes.forEach(traverse);
  }

  traverse(root);

  return result;
}

/**
 * Calculate crop
 * @param curSize
 * @param lastSize
 * @param lastCrop
 * @returns
 */
export function calculateCrop(
  curSize: WindowSize,
  lastSize: WindowSize,
  lastCrop: IRect,
  anchor: string
): IRect {
  let x = lastCrop.x;
  let y = lastCrop.y;
  let width = lastCrop.width;
  let height = lastCrop.height;

  if (anchor === "middle-left" || anchor === "middle-right") {
    if (curSize.width < lastSize.width) {
      // Horizontal narrow
      width = lastCrop.width * (curSize.width / lastSize.width);
      if (anchor === "middle-left") {
        x = lastCrop.x + lastCrop.width - width;
      }
    } else {
      // Horizontal extend
      width = curSize.width * (lastCrop.height / lastSize.height);
      if (width > lastSize.width - lastCrop.x) {
        height =
          curSize.height * ((lastSize.width - lastCrop.x) / curSize.width);
      }
    }
  } else if (anchor === "top-center" || anchor === "bottom-center") {
    if (curSize.height < lastSize.height) {
      // Vertical narrow
      height = lastCrop.height * (curSize.height / lastSize.height);
      if (anchor === "top-center") {
        y = lastCrop.y + lastCrop.height - height;
      }
    } else {
      // Vertical extend
      height = curSize.height * (lastCrop.width / lastSize.width);
      if (height > lastCrop.height - lastCrop.y) {
        width =
          curSize.width * ((lastCrop.height - lastCrop.y) / curSize.height);
      }
    }
  }

  return { x, y, width, height };
}

/**
 * Create filter
 * @param grayscale
 * @param invert
 * @param sepia
 * @param solarize
 * @returns
 */
export function createFilter(option: KonvaShape): Filter[] {
  const filters: Filter[] = [
    Konva.Filters.Pixelate,
    Konva.Filters.Brighten,
    Konva.Filters.Contrast,
    Konva.Filters.Blur,
    Konva.Filters.Enhance,
    Konva.Filters.Noise,
  ];

  if (option.grayscale) {
    filters.push(Konva.Filters.Grayscale);
  }

  if (option.invert) {
    filters.push(Konva.Filters.Invert);
  }

  if (option.sepia) {
    filters.push(Konva.Filters.Sepia);
  }

  if (option.solarize) {
    filters.push(Konva.Filters.Solarize);
  }

  return filters;
}

const lineDashes: Record<KonvaLineStyle, number[]> = {
  solid: undefined,
  dashed: [10, 5],
  dotted: [2, 5],
  "dotted-dashed": [10, 5, 2, 5],
};

/**
 * Create line dash
 * @param style
 * @returns
 */
export function createLineDash(style: KonvaLineStyle): number[] {
  return lineDashes[style];
}

/* Transform point */
export function transformPoint(point: Vector2d, option: KonvaShape): Vector2d {
  // // offset translate
  // let x: number = point.x - option.offsetX;
  // let y: number = point.y - option.offsetY;

  // // scale
  // x = x * option.scaleX;
  // y = y * option.scaleY;

  // // skew
  // const sx: number = x + option.skewX * y;
  // const ys: number = option.skewY * x + y;
  // x = sx;
  // y = ys;

  // // rotate
  // const rad: number = (Math.PI / 180) * option.rotation;
  // const cos: number = Math.cos(rad);
  // const sin: number = Math.sin(rad);
  // const xr = x * cos - y * sin;
  // const yr = x * sin + y * cos;
  // x = xr;
  // y = yr;

  // // position translate
  // x = x + option.x;
  // y = y + option.y;

  // return { x, y };

  return new Konva.Transform()
    .translate(option.x, option.y)
    .rotate((Math.PI / 180) * option.rotation)
    .skew(option.skewX, option.skewY)
    .scale(option.scaleX, option.scaleY)
    .translate(-option.offsetX, -option.offsetY)
    .point(point);
}

/* Invert point */
export function invertPoint(point: Vector2d, option: KonvaShape): Vector2d {
  // // undo position translate
  // let x: number = point.x - option.x;
  // let y: number = point.y - option.y;

  // // undo rotate
  // const rad: number = (Math.PI / 180) * option.rotation;
  // const cos: number = Math.cos(-rad);
  // const sin: number = Math.sin(-rad);
  // const xr: number = x * cos - y * sin;
  // const yr: number = x * sin + y * cos;
  // x = xr;
  // y = yr;

  // // undo skew
  // const det: number = 1 - option.skewX * option.skewY;

  // const xs: number = (x - option.skewX * y) / det;
  // const ys: number = (-option.skewY * x + y) / det;
  // x = xs;
  // y = ys;

  // // undo scale
  // x = x / option.scaleX;
  // y = y / option.scaleY;

  // // undo offset translate
  // x = x + option.offsetX;
  // y = y + option.offsetY;

  // return { x, y };

  return new Konva.Transform()
    .translate(option.x, option.y)
    .rotate((Math.PI / 180) * option.rotation)
    .skew(option.skewX, option.skewY)
    .scale(option.scaleX, option.scaleY)
    .translate(-option.offsetX, -option.offsetY)
    .invert()
    .point(point);
}
