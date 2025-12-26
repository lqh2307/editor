import { KonvaTooltipAPI, KonvaTooltip } from "../../components/KonvaTooltip";
import { KonvaShape, KonvaShapeType } from "../../components/KonvaShape";
import { createPathsFromSVG, removeSvgTag } from "../../utils/Shapes";
import { KonvaGridAPI, KonvaGrid } from "../../components/KonvaGrid";
import { useShapesContext, useStageContext } from "../../contexts";
import { calculateLatLonFromPointer } from "../../utils/Map/Utils";
import { SnackbarAlert } from "../../components/SnackbarAlert";
import { stringToBase64 } from "../../utils/Image";
import { KonvaDragDrop } from "../../types/Konva";
import { useTranslation } from "react-i18next";
import { downloadFile } from "../../apis/file";
import { useMapContext } from "../../contexts";
import { Stage, Layer } from "react-konva";
import { Vector2d } from "konva/lib/types";
import { CanvasShapes } from "./Shapes";
import { DrawingInfo } from "./Types";
import { AxiosResponse } from "axios";
import { Box } from "@mui/material";
import { nanoid } from "nanoid";
import React from "react";
import Konva from "konva";
import {
  KonvaBackgroundAPI,
  KonvaBackground,
} from "../../components/KonvaBackground";
import {
  KonvaGuideLinesAPI,
  KonvaGuideLines,
} from "../../components/KonvaGuideLines";
import {
  KonvaTransformerAPI,
  KonvaTransformer,
  KonvaTFM,
} from "../../components/KonvaTransformer";

export const Canvas = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const {
    snackBarAlert,
    drawingMode,
    getStage,
    setStage,
    getBackground,
    setBackground,
    getGrid,
    setGrid,
    getGuideLines,
    setGuideLines,
    dragStage,
    zoomStage,
    getIsStageDragable,
    setStageDragable,
    setPointerStyle,
    getStagePointerPosition,
    setStagePointerPosition,
    updateSnackbarAlert,
    setDrawingMode,
  } = useStageContext();

  const {
    selectedShape,
    transformerRefs,
    addShapes,
    updateShape,
    updateSelectedIds,
  } = useShapesContext();

  const { calibration } = useMapContext();
  const tooltipRef = React.useRef<KonvaTooltipAPI>(undefined);

  // Store drawing
  function createResetDrawingInfo(): DrawingInfo {
    return {
      previousMode: undefined,
      lines: undefined,
      points: undefined,
      previewPoints: undefined,
      isDrawing: false,
      shapeId: undefined,
    };
  }

  const drawingInfoRef = React.useRef<DrawingInfo>(createResetDrawingInfo());

  const assignStage = React.useCallback(
    (stage: Konva.Stage): void => {
      if (!getStage()) {
        setStage(stage);
      }
    },
    [setStage, getStage]
  );

  const assignBackground = React.useCallback(
    (background: KonvaBackgroundAPI): void => {
      if (!getBackground()) {
        setBackground(background);
      }
    },
    [setBackground, getBackground]
  );

  const assignGrid = React.useCallback(
    (grid: KonvaGridAPI): void => {
      if (!getGrid()) {
        setGrid(grid);
      }
    },
    [setGrid, setGrid]
  );

  const assignGuideLines = React.useCallback(
    (guideLines: KonvaGuideLinesAPI): void => {
      if (!getGuideLines()) {
        setGuideLines(guideLines);
      }
    },
    [setGuideLines, getGuideLines]
  );

  // Store transformer
  const transformersRef = React.useRef<KonvaTFM[]>([
    {
      id: "cropper",
      borderStroke: "#00ff00",
      borderStrokeWidth: 1.5,
      borderDash: [10, 10],
      anchorStyleFunc: (anchor) => {
        if (anchor.hasName("top-center") || anchor.hasName("bottom-center")) {
          anchor.setAttrs({
            fill: "#a5ff00",
            stroke: "#00ff00",
            strokeWidth: 1,
            cornerRadius: 5,
            height: 10,
            offsetY: 5,
            width: 30,
            offsetX: 15,
          });
        } else if (
          anchor.hasName("middle-left") ||
          anchor.hasName("middle-right")
        ) {
          anchor.setAttrs({
            fill: "#a5ff00",
            stroke: "#00ff00",
            strokeWidth: 1,
            cornerRadius: 5,
            height: 30,
            offsetY: 15,
            width: 10,
            offsetX: 5,
          });
        } else if (anchor.hasName("rotater")) {
          anchor.setAttrs({
            fill: "#a5ff00",
            stroke: "#00ff00",
            strokeWidth: 1.5,
            cornerRadius: 10,
            height: 20,
            offsetY: 10,
            width: 20,
            offsetX: 10,
          });
        } else {
          anchor.setAttrs({
            fill: "#a5ff00",
            stroke: "#00ff00",
            strokeWidth: 1,
            cornerRadius: 5,
            height: 15,
            offsetY: 7.5,
            width: 15,
            offsetX: 7.5,
          });
        }
      },
    },
    {
      id: "transformer",
      borderStroke: "#ff0000",
      borderStrokeWidth: 1.5,
      borderDash: [20, 10],
      anchorStyleFunc: (anchor) => {
        if (anchor.hasName("top-center") || anchor.hasName("bottom-center")) {
          anchor.setAttrs({
            fill: "#ffa500",
            stroke: "#ff0000",
            strokeWidth: 1,
            cornerRadius: 2,
            height: 4,
            offsetY: 2,
            width: 16,
            offsetX: 8,
          });
        } else if (
          anchor.hasName("middle-left") ||
          anchor.hasName("middle-right")
        ) {
          anchor.setAttrs({
            fill: "#ffa500",
            stroke: "#ff0000",
            strokeWidth: 1,
            cornerRadius: 2,
            height: 16,
            offsetY: 8,
            width: 4,
            offsetX: 2,
          });
        } else if (anchor.hasName("rotater")) {
          anchor.setAttrs({
            fill: "#ffa500",
            stroke: "#ff0000",
            strokeWidth: 1.5,
            cornerRadius: 6,
            height: 12,
            offsetY: 6,
            width: 12,
            offsetX: 6,
          });
        } else {
          anchor.setAttrs({
            fill: "#ffa500",
            stroke: "#ff0000",
            strokeWidth: 1,
            cornerRadius: 4,
            height: 8,
            offsetY: 4,
            width: 8,
            offsetX: 4,
          });
        }
      },
    },
    {
      id: "single-transformer",
      borderStroke: "#0000ff",
      borderStrokeWidth: 1.5,
      borderDash: [20, 10],
      anchorStyleFunc: (anchor) => {
        if (anchor.hasName("top-center") || anchor.hasName("bottom-center")) {
          anchor.setAttrs({
            fill: "#00a5ff",
            stroke: "#0000ff",
            strokeWidth: 1,
            cornerRadius: 2,
            height: 4,
            offsetY: 2,
            width: 16,
            offsetX: 8,
          });
        } else if (
          anchor.hasName("middle-left") ||
          anchor.hasName("middle-right")
        ) {
          anchor.setAttrs({
            fill: "#00a5ff",
            stroke: "#0000ff",
            strokeWidth: 1,
            cornerRadius: 2,
            height: 16,
            offsetY: 8,
            width: 4,
            offsetX: 2,
          });
        } else if (anchor.hasName("rotater")) {
          anchor.setAttrs({
            fill: "#00a5ff",
            stroke: "#0000ff",
            strokeWidth: 1.5,
            cornerRadius: 6,
            height: 12,
            offsetY: 6,
            width: 12,
            offsetX: 6,
          });
        } else {
          anchor.setAttrs({
            fill: "#00a5ff",
            stroke: "#0000ff",
            strokeWidth: 1,
            cornerRadius: 4,
            height: 8,
            offsetY: 4,
            width: 8,
            offsetX: 4,
          });
        }
      },
    },
  ]);

  const handleOnMounted = React.useCallback(
    (id?: string, transformer?: KonvaTransformerAPI): void => {
      if (!transformerRefs[id]) {
        transformerRefs[id] = transformer;
      }
    },
    [transformerRefs]
  );

  const handleOnUnMounted = React.useCallback(
    (id?: string): void => {
      delete transformerRefs[id];
    },
    [transformerRefs]
  );

  // Update if selected shape id is changed
  React.useEffect(() => {
    if (
      !selectedShape.id ||
      !drawingInfoRef.current.shapeId ||
      selectedShape.id !== drawingInfoRef.current.shapeId
    ) {
      // Reset cursor style
      setPointerStyle?.();

      // Reset drawing mode
      setDrawingMode?.(undefined);

      // Reset drawing info
      drawingInfoRef.current = createResetDrawingInfo();
    }
  }, [selectedShape.id]);

  // Update if drawing mode is changed
  React.useEffect(() => {
    if (drawingMode) {
      // Set cursor style
      setPointerStyle?.("crosshair");

      // Store drawing info
      drawingInfoRef.current = {
        previousMode: drawingMode,
        isDrawing: false,
      };

      const drawingInfo: DrawingInfo = drawingInfoRef.current;

      // Store current shape or Add new shape
      if (
        selectedShape.type === drawingMode ||
        (selectedShape.type === "free-drawing" &&
          (drawingMode === "destination-out" || drawingMode === "source-over"))
      ) {
        if (selectedShape.points) {
          drawingInfo.points = selectedShape.points;
          drawingInfo.previewPoints = drawingInfo.points.slice(0) as number[];
          drawingInfo.previewPoints.push(0, 0);
        } else {
          drawingInfo.lines = selectedShape.lines;
        }
      } else {
        drawingInfo.shapeId = nanoid();

        if (
          drawingMode === "multi-line" ||
          drawingMode === "multi-arrow" ||
          drawingMode === "multi-line-curve" ||
          drawingMode === "multi-arrow-curve"
        ) {
          drawingInfo.points = [];
          drawingInfo.previewPoints = drawingInfo.points.slice(0) as number[];
          drawingInfo.previewPoints.push(0, 0);

          addShapes?.(
            [
              {
                id: drawingInfo.shapeId,
                type: drawingMode as KonvaShapeType,
                points: drawingInfo.points,
              },
            ],
            false,
            false,
            undefined
          );
        } else {
          drawingInfo.lines = [];

          addShapes?.(
            [
              {
                id: drawingInfo.shapeId,
                type: "free-drawing",
                lines: drawingInfo.lines,
              },
            ],
            false,
            false,
            undefined
          );
        }
      }
    } else if (drawingInfoRef.current.previousMode) {
      // Reset cursor style
      setPointerStyle?.();

      // Reset drawing info
      drawingInfoRef.current = createResetDrawingInfo();
    }
  }, [drawingMode]);

  const handleStageMouseWheel = React.useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>): void => {
      zoomStage(e.evt?.deltaY > 0, true);
    },
    [zoomStage]
  );

  const handleStageDragOver = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
    },
    []
  );

  const handleStageDrop = React.useCallback(
    async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
      try {
        setStagePointerPosition(e);

        const data: KonvaDragDrop = JSON.parse(
          e.dataTransfer?.getData("data")
        ) as KonvaDragDrop;
        let shapeOptions: KonvaShape[];
        let processBase64ImageURL: boolean = false;

        if (data.componentURL) {
          // Call API to download file
          const fileResponse: AxiosResponse = await downloadFile({
            id: data.componentURL,
            responseType: "json",
          });

          const shapes: KonvaShape[] = fileResponse.data as KonvaShape[];

          // Create new ids
          const newShapeIds: Record<string, string> = {};

          shapes.forEach((shape) => {
            newShapeIds[shape.id] = nanoid();
          });

          const groups: Record<string, string[]> = {};

          shapes.forEach((shape) => {
            if (shape.groupIds && !groups[newShapeIds[shape.groupIds[0]]]) {
              groups[newShapeIds[shape.groupIds[0]]] = shape.groupIds.map(
                (id) => newShapeIds[id]
              );
            }
          });

          shapeOptions = shapes.map((item) => {
            const { id, groupIds, ...newShape }: KonvaShape = item;

            newShape.id = newShapeIds[item.id];

            if (groupIds) {
              newShape.groupIds = groups[newShapeIds[groupIds[0]]];
              newShape.originGroupIds = newShape.groupIds;
            }

            return newShape;
          });

          processBase64ImageURL = true;
        } else {
          const shapeOption: KonvaShape = data as KonvaShape;

          if (data.pathURL) {
            shapeOption.paths = createPathsFromSVG(data.pathURL, 200, 200);
          } else if (data.svgURL) {
            shapeOption.imageURL = await stringToBase64(
              removeSvgTag(data.svgURL, "text"),
              "svg"
            );

            processBase64ImageURL = true;
          }

          shapeOptions = [shapeOption];
        }

        await addShapes(
          shapeOptions,
          false,
          processBase64ImageURL,
          getStagePointerPosition()
        );
      } catch (error) {
        updateSnackbarAlert(
          `${t("toolBar.addShape.common.snackBarAlert.error")} ${error}`,
          "error"
        );
      }
    },
    [
      t,
      addShapes,
      getStagePointerPosition,
      setStagePointerPosition,
      updateSnackbarAlert,
    ]
  );

  const handleStageContextMenu = React.useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      e.evt?.preventDefault();
    },
    []
  );

  const handleStageMouseDown = React.useCallback(
    async (e: Konva.KonvaEventObject<MouseEvent>): Promise<void> => {
      if (e.evt?.button === 2) {
        // Set cursor style
        setPointerStyle("move");

        // Enable draggable stage
        setStageDragable(true);
      } else if (e.evt?.button === 0) {
        const drawingInfo: DrawingInfo = drawingInfoRef.current;

        if (drawingInfo.points) {
          const pointer: Vector2d = getStagePointerPosition();
          if (!pointer) {
            return;
          }

          // Add new point
          const length: number = drawingInfo.previewPoints.length;
          drawingInfo.points.push(
            drawingInfo.previewPoints[length - 2],
            drawingInfo.previewPoints[length - 1]
          );
          drawingInfo.previewPoints.push(0, 0);

          // Update shape
          updateShape(
            {
              points: drawingInfo.points,
            },
            true,
            true
          );
        } else if (drawingInfo.lines) {
          const pointer: Vector2d = getStagePointerPosition(
            drawingInfo.shapeId
          );
          if (!pointer) {
            return;
          }

          // Add new line
          drawingInfo.lines.push({
            id: nanoid(),
            points: [pointer.x, pointer.y],
            globalCompositeOperation: drawingInfo.previousMode,
          });

          // Update shape
          updateShape(undefined, true, false);

          // Mark drawing on
          drawingInfo.isDrawing = true;
        } else if (e.target instanceof Konva.Stage) {
          // Reset selected ids
          updateSelectedIds(undefined, true);
        }
      }
    },
    [
      updateSelectedIds,
      updateShape,
      setPointerStyle,
      setStageDragable,
      getStagePointerPosition,
    ]
  );

  const handleStageMouseMove = React.useCallback((): void => {
    if (getIsStageDragable()) {
      dragStage();

      return;
    }

    const drawingInfo: DrawingInfo = drawingInfoRef.current;

    if (drawingInfo.points) {
      const pointer: Vector2d = getStagePointerPosition();
      if (!pointer) {
        return;
      }

      // Add new point to last points
      const length: number = drawingInfo.previewPoints.length;
      drawingInfo.previewPoints[length - 2] = pointer.x;
      drawingInfo.previewPoints[length - 1] = pointer.y;

      // Update shape
      updateShape(
        {
          points: drawingInfo.previewPoints,
        },
        true,
        false
      );
    } else {
      if (drawingInfo.isDrawing) {
        const pointer: Vector2d = getStagePointerPosition(drawingInfo.shapeId);
        if (!pointer) {
          return;
        }

        // Add new point to last line
        drawingInfo.lines[drawingInfo.lines.length - 1].points.push(
          pointer.x,
          pointer.y
        );

        // Update shape
        updateShape(undefined, true, false);
      }
    }

    // Luôn cập nhật tooltip khi di chuột trên canvas
    const p: Vector2d = getStagePointerPosition();
    if (
      p &&
      calibration.topRight &&
      calibration.bottomLeft &&
      tooltipRef.current
    ) {
      const bgApi = getBackground();
      const bgNode = bgApi?.getNode();
      const latLon = calculateLatLonFromPointer(p, bgNode, calibration);
      if (latLon) {
        tooltipRef.current.updateProp({
          text: `Lat: ${latLon.lat.toFixed(6)}\nLon: ${latLon.lon.toFixed(6)}`,
          x: p.x + 8,
          y: p.y + 8,
        });
      } else {
        tooltipRef.current.updateProp({ text: "" });
      }
    }
  }, [
    updateShape,
    dragStage,
    getIsStageDragable,
    getStagePointerPosition,
    calibration,
    getBackground,
  ]);

  const handleStageMouseUp = React.useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      const drawingInfo: DrawingInfo = drawingInfoRef.current;

      if (e.evt?.button === 2) {
        // Set/Reset cursor style
        setPointerStyle(drawingInfo.previousMode ? "crosshair" : "default");

        // Disable draggable stage
        setStageDragable(false);
      } else if (e.evt?.button === 0) {
        if (drawingInfo.lines) {
          const lastPoints: number[] =
            drawingInfo.lines[drawingInfo.lines.length - 1].points;

          if (lastPoints.length) {
            const pointer: Vector2d = getStagePointerPosition(
              drawingInfo.shapeId
            );
            if (!pointer) {
              return;
            }

            // Add new point to last line
            lastPoints.push(pointer.x, pointer.y);
          }

          // Update shape
          updateShape(undefined, true, true);
        }

        // Mark drawing off
        drawingInfo.isDrawing = false;
      }
    },
    [updateShape, setStageDragable, setPointerStyle, getStagePointerPosition]
  );

  const handleStageClick = React.useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      if (
        e.evt?.button === 0 &&
        !drawingInfoRef.current.previousMode &&
        e.target instanceof Konva.Stage
      ) {
        // Reset selected ids
        updateSelectedIds(undefined, true);
      }
    },
    [updateSelectedIds]
  );

  return (
    <Box
      sx={{ width: "100%", height: "100%" }}
      onDragOver={handleStageDragOver}
      onDrop={handleStageDrop}
    >
      {/* Stage */}
      <Stage
        ref={assignStage}
        listening={true}
        draggable={false}
        onWheel={handleStageMouseWheel}
        onClick={handleStageClick}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onContextMenu={handleStageContextMenu}
      >
        {/* Backgroud/Grid */}
        <Layer id={"base"} listening={false} draggable={false}>
          <KonvaBackground ref={assignBackground} />

          <KonvaGrid ref={assignGrid} />
        </Layer>

        {/* Shapes/Transformers/Map tooltip */}
        <Layer id={"shapes"} listening={true} draggable={false}>
          <CanvasShapes />

          {transformersRef.current.map((item) => (
            <KonvaTransformer
              key={item.id}
              transformerOption={item}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
            />
          ))}

          <KonvaTooltip
            ref={tooltipRef}
            id={"map-tooltip"}
            text={""}
            x={0}
            y={0}
            fontSize={12}
            textColor={"#fff"}
            textOpacity={1}
            backgroundColor={"#000"}
            backgroundOpacity={0.6}
            padding={4}
          />
        </Layer>

        {/* Guide line/Tooltip */}
        <Layer id={"guide"} listening={false} draggable={false}>
          <KonvaGuideLines ref={assignGuideLines} />
        </Layer>
      </Stage>

      {/* Alert */}
      <SnackbarAlert {...snackBarAlert} />
    </Box>
  );
});
