import { KonvaGridAPI, KonvaGrid } from "../../components/KonvaGrid";
import { SnackbarAlert } from "../../components/SnackbarAlert";
import { KonvaShape } from "../../components/KonvaShape";
import { createPathsFromSVG } from "../../utils/Shapes";
import { KonvaDragDrop } from "../../types/Konva";
import { useTranslation } from "react-i18next";
import { downloadFile } from "../../apis/file";
import { Stage, Layer, Rect } from "react-konva";
import { Vector2d } from "konva/lib/types";
import { FreeDrawingInfo } from "./Types";
import { CanvasShapes } from "./Shapes";
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
  useFreeDrawingContext,
  useShapesContext,
  useStageContext,
} from "../../contexts";
import {
  KonvaTransformerAPI,
  KonvaTransformer,
} from "../../components/KonvaTransformer";

export const Canvas = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const {
    snackBarAlert,
    getStage,
    setStage,
    getBackground,
    setBackground,
    getGrid,
    setGrid,
    getGuideLines,
    setGuideLines,
    getCropper,
    setCropper,
    getTransformer,
    setTransformer,
    getSingleTransformer,
    setSingleTransformer,
    dragStage,
    zoomStage,
    getIsStageDragable,
    setStageDragable,
    setPointerStyle,
    getStagePointerPosition,
    setStagePointerPosition,
    updateSnackbarAlert,
  } = useStageContext();

  const { selectedShape, updateShape, addShapes, updateSelectedIds, shapeList } =
    useShapesContext();

  const { freeDrawingMode, setFreeDrawingMode } = useFreeDrawingContext();

  // Store is free drawing
  const freeDrawingInfoRef = React.useRef<FreeDrawingInfo>({
    previousMode: undefined,
    lines: undefined,
    isDrawing: false,
    shapeId: undefined,
    polylinePoints: undefined,
    polylineOrigin: undefined,
    isPolylineDrawing: false,
  });

  // Marquee selection state/refs
  const selectingRef = React.useRef<boolean>(false);
  const selectStartRef = React.useRef<Vector2d>(undefined);
  const extendSelectRef = React.useRef<boolean>(false);
  const didSelectRef = React.useRef<boolean>(false);
  const [selectRect, setSelectRect] = React.useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
  }>({ x: 0, y: 0, width: 0, height: 0, visible: false });

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

  const assignSingleTransformer = React.useCallback(
    (singleTransformer: KonvaTransformerAPI): void => {
      if (!getSingleTransformer()) {
        setSingleTransformer(singleTransformer);
      }
    },
    [setSingleTransformer, getSingleTransformer]
  );

  const assignCropper = React.useCallback(
    (cropper: KonvaTransformerAPI): void => {
      if (!getCropper()) {
        setCropper(cropper);
      }
    },
    [setCropper, getCropper]
  );

  const assignTransformer = React.useCallback(
    (transformer: KonvaTransformerAPI): void => {
      if (!getTransformer()) {
        setTransformer(transformer);
      }
    },
    [setTransformer, getTransformer]
  );

  // Update if selected shape id is changed
  React.useEffect(() => {
    if (
      !selectedShape.id ||
      selectedShape.id !== freeDrawingInfoRef.current.shapeId
    ) {
      // Reset cursor style
      setPointerStyle();

      // Reset free drawing mode
      setFreeDrawingMode(undefined);

      // Reset free drawing info
      freeDrawingInfoRef.current = {
        previousMode: undefined,
        lines: undefined,
        isDrawing: false,
        shapeId: undefined,
        polylinePoints: undefined,
        polylineOrigin: undefined,
        isPolylineDrawing: false,
      };
    }
  }, [selectedShape.id, setPointerStyle, setFreeDrawingMode]);

  // Update if free drawing mode is changed
  React.useEffect(() => {
    if (freeDrawingMode) {
      if (freeDrawingMode === freeDrawingInfoRef.current.previousMode) {
        return;
      }

      // Set cursor style
      setPointerStyle("crosshair");

      // Store free drawing info
      if (freeDrawingMode === "polyline") {
        freeDrawingInfoRef.current = {
          previousMode: freeDrawingMode,
          isDrawing: false,
          lines: undefined,
          shapeId: nanoid(),
          polylinePoints: [],
          polylineOrigin: undefined,
          isPolylineDrawing: false,
        };
      } else {
        freeDrawingInfoRef.current = {
          previousMode: freeDrawingMode,
          isDrawing: false,
          lines: selectedShape.lines,
          shapeId: selectedShape.lines ? selectedShape.id : nanoid(),
          polylinePoints: undefined,
          polylineOrigin: undefined,
          isPolylineDrawing: false,
        };
      }
    } else if (freeDrawingInfoRef.current.previousMode) {
      // Reset cursor style
      setPointerStyle();

      // Reset free drawing info
      freeDrawingInfoRef.current = {
        previousMode: undefined,
        lines: undefined,
        isDrawing: false,
        shapeId: undefined,
        polylinePoints: undefined,
        polylineOrigin: undefined,
        isPolylineDrawing: false,
      };
    }
  }, [freeDrawingMode, selectedShape.id, selectedShape.lines, setPointerStyle]);

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

        if (data.componentURL) {
          // Call API to download file
          const fileResponse: AxiosResponse = await downloadFile({
            id: data.componentURL,
            responseType: "json",
          });

          shapeOptions = fileResponse.data as KonvaShape[];
        } else {
          const shapeOption: KonvaShape = data as KonvaShape;

          if (data.type === "path" && data.imageURL) {
            shapeOption.paths = createPathsFromSVG(data.imageURL, 200, 200);
          }

          shapeOptions = [shapeOption];
        }

        await addShapes(shapeOptions, false, false, getStagePointerPosition());
      } catch (error) {
        updateSnackbarAlert(
          `${t("toolBar.addShape.common.snackBarAlert.error")} ${error}`,
          "error"
        );
      }
    },
    [
      addShapes,
      getStagePointerPosition,
      setStagePointerPosition,
      updateSnackbarAlert,
      t,
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
        const freeDrawingInfo: FreeDrawingInfo = freeDrawingInfoRef.current;

        if (freeDrawingInfo.previousMode && freeDrawingInfo.previousMode !== "polyline") {
          if (!freeDrawingInfo.lines) {
            // Store free drawing lines
            freeDrawingInfo.lines = [];

            // Add new shape
            await addShapes(
              [
                {
                  id: freeDrawingInfo.shapeId,
                  type: "free-drawing",
                  lines: freeDrawingInfo.lines,
                },
              ],
              undefined,
              false,
              undefined
            );

            const pointer: Vector2d = getStagePointerPosition(
              freeDrawingInfo.shapeId
            );
            if (!pointer) {
              return;
            }
          }

          const pointer: Vector2d = getStagePointerPosition(
            freeDrawingInfo.shapeId
          );
          if (!pointer) {
            return;
          }

          // Add new line
          freeDrawingInfo.lines.push({
            id: nanoid(),
            points: [pointer.x, pointer.y],
            globalCompositeOperation:
              freeDrawingInfo.previousMode === "pen"
                ? "source-over"
                : "destination-out",
          });

          // Update shape
          updateShape(undefined, true, false);

          // Mark drawing on
          freeDrawingInfo.isDrawing = true;
        } else if (freeDrawingInfo.previousMode === "polyline") {
          const pointer: Vector2d = getStagePointerPosition();
          if (!pointer) return;

          // First click: create shape
          if (!freeDrawingInfo.polylinePoints || !freeDrawingInfo.polylinePoints.length) {
            freeDrawingInfo.polylineOrigin = { x: pointer.x, y: pointer.y };
            freeDrawingInfo.polylinePoints = [0, 0, 0, 0]; // first anchor + dynamic endpoint
            // Add new line shape
            await addShapes(
              [
                {
                  id: freeDrawingInfo.shapeId,
                  type: "polyline",
                  x: pointer.x,
                  y: pointer.y,
                  offsetX: 0,
                  offsetY: 0,
                  points: freeDrawingInfo.polylinePoints.slice(0),
                  strokeEnabled: true,
                  strokeWidth: 2,
                  fillEnabled: false,
                },
              ],
              undefined,
              false,
              undefined
            );
            freeDrawingInfo.isPolylineDrawing = true;
          } else {
            // Subsequent click: fix last dynamic point and append new dynamic endpoint
            const ox = freeDrawingInfo.polylineOrigin.x;
            const oy = freeDrawingInfo.polylineOrigin.y;
            const relX = pointer.x - ox;
            const relY = pointer.y - oy;
            const pts = freeDrawingInfo.polylinePoints;
            // Replace dynamic endpoint with fixed anchor
            pts[pts.length - 2] = relX;
            pts[pts.length - 1] = relY;
            // Add new dynamic endpoint duplicated
            pts.push(relX, relY);
            freeDrawingInfo.isPolylineDrawing = true;
            // Update shape
            updateShape({ id: freeDrawingInfo.shapeId, points: pts.slice(0), type: "polyline" }, true, false);
          }
        } else if (e.target instanceof Konva.Stage) {
<<<<<<< HEAD
          // Start marquee selection
          const p: Vector2d = getStagePointerPosition();
          if (!p) return;

          selectingRef.current = true;
          extendSelectRef.current = !!(e.evt?.ctrlKey || e.evt?.shiftKey);
          didSelectRef.current = false;
          selectStartRef.current = p;
          setSelectRect({ x: p.x, y: p.y, width: 0, height: 0, visible: true });
=======
          // Reset selected ids
          updateSelectedIds(undefined, true);
>>>>>>> origin/tmp
        }
      }
    },
    [
      updateShape,
      addShapes,
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

    const freeDrawingInfo: FreeDrawingInfo = freeDrawingInfoRef.current;

    if (freeDrawingInfo.previousMode === "polyline") {
      if (freeDrawingInfo.isPolylineDrawing && freeDrawingInfo.polylinePoints?.length) {
        const pointer: Vector2d = getStagePointerPosition();
        if (!pointer) return;
        const ox = freeDrawingInfo.polylineOrigin.x;
        const oy = freeDrawingInfo.polylineOrigin.y;
        const relX = pointer.x - ox;
        const relY = pointer.y - oy;
        const pts = freeDrawingInfo.polylinePoints;
        // Update dynamic endpoint
        pts[pts.length - 2] = relX;
        pts[pts.length - 1] = relY;
        updateShape({ id: freeDrawingInfo.shapeId, points: pts.slice(0), type: "polyline" }, true, false);
      }
    } else if (freeDrawingInfo.isDrawing) {
      const pointer: Vector2d = getStagePointerPosition(
        freeDrawingInfo.shapeId
      );
      if (!pointer) {
        return;
      }

      // Add new point to last line
      freeDrawingInfo.lines[freeDrawingInfo.lines.length - 1].points.push(
        pointer.x,
        pointer.y
      );

      // Update shape
      updateShape(undefined, true, false);
      return;
    }

    // Update marquee selection rect
    if (selectingRef.current) {
      const p: Vector2d = getStagePointerPosition();
      if (!p || !selectStartRef.current) return;
      const x1 = selectStartRef.current.x;
      const y1 = selectStartRef.current.y;
      const x2 = p.x;
      const y2 = p.y;
      const x = Math.min(x1, x2);
      const y = Math.min(y1, y2);
      const width = Math.abs(x2 - x1);
      const height = Math.abs(y2 - y1);
      setSelectRect({ x, y, width, height, visible: true });
    }
  }, [updateShape, dragStage, getIsStageDragable, getStagePointerPosition]);

  const handleStageMouseUp = React.useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      const freeDrawingInfo: FreeDrawingInfo = freeDrawingInfoRef.current;

      if (e.evt?.button === 2) {
        // Set/Reset cursor style
        setPointerStyle(freeDrawingInfo.previousMode ? "crosshair" : "default");

        // Disable draggable stage
        setStageDragable(false);
      } else if (e.evt?.button === 0) {
        if (freeDrawingInfo.previousMode && freeDrawingInfo.previousMode !== "polyline") {
          const pointer: Vector2d = getStagePointerPosition(
            freeDrawingInfo.shapeId
          );
          if (!pointer) {
            return;
          }

          // Add new point to last line
          freeDrawingInfo.lines[freeDrawingInfo.lines.length - 1].points.push(
            pointer.x,
            pointer.y
          );

          // Update shape
          updateShape(undefined, true, true);
        }

        // Mark drawing off
        freeDrawingInfo.isDrawing = false;

        // Finish marquee selection
        if (selectingRef.current) {
          selectingRef.current = false;
          const { x, y, width, height } = selectRect;
          setSelectRect((r) => ({ ...r, visible: false }));

          // Ignore tiny clicks (let stage click handler manage clear)
          if (width < 3 && height < 3) {
            return;
          }

          const x1 = x;
          const y1 = y;
          const x2 = x + width;
          const y2 = y + height;

          // Compute intersections with shapes' boxes
          const selectedIds: string[] = [];
          const addId = (id: string) => {
            if (!selectedIds.includes(id)) selectedIds.push(id);
          };

          shapeList?.forEach((shape) => {
            const box = shape.box;
            if (!box) return;
            const intersects =
              !(box.right < x1 || box.left > x2 || box.bottom < y1 || box.top > y2);
            if (intersects) {
              if (shape.groupIds && shape.groupIds.length) {
                shape.groupIds.forEach(addId);
              } else {
                addId(shape.id);
              }
            }
          });

          if (selectedIds.length) {
            updateSelectedIds({ selecteds: selectedIds }, !extendSelectRef.current);
            didSelectRef.current = true;
          } else if (!extendSelectRef.current) {
            // Nothing selected: clear selection if not extending
            updateSelectedIds({}, true);
          }
        }
      } else if (freeDrawingInfo.previousMode === "polyline") {
        // Nothing on mouse up for polyline (points added on mousedown)
      }
    },
    [
      selectRect,
      shapeList,
      updateSelectedIds,
      updateShape,
      setStageDragable,
      setPointerStyle,
      getStagePointerPosition,
    ]
  );

  const handleStageDblClick = React.useCallback(
    (): void => {
      const info: FreeDrawingInfo = freeDrawingInfoRef.current;
      if (info.previousMode === "polyline" && info.polylinePoints?.length) {
        // Remove trailing dynamic duplicate point
        if (info.polylinePoints.length >= 4) {
          info.polylinePoints.splice(info.polylinePoints.length - 2, 2);
        }
        // Final update commit history
        updateShape({ id: info.shapeId, points: info.polylinePoints.slice(0), type: "polyline" }, true, true);
        // Exit polyline mode
        setFreeDrawingMode(undefined);
      }
    },
    [setFreeDrawingMode, updateShape]
  );

  const handleStageClick = React.useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      if (
        e.evt?.button === 0 &&
        !freeDrawingInfoRef.current.previousMode &&
        e.target instanceof Konva.Stage
      ) {
        if (didSelectRef.current) {
          // Skip clearing if we just did marquee selection
          didSelectRef.current = false;
          return;
        }
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
        onDblClick={handleStageDblClick}
        onContextMenu={handleStageContextMenu}
      >
        {/* Backgroud/Grid */}
        <Layer id={"base"} listening={false} draggable={false}>
          <KonvaBackground ref={assignBackground} />

          <KonvaGrid ref={assignGrid} />
        </Layer>

        {/* Shapes */}
        <Layer id={"shapes"} listening={true} draggable={false}>
          <CanvasShapes />

          <KonvaTransformer ref={assignCropper} />

          <KonvaTransformer ref={assignTransformer} />

          <KonvaTransformer ref={assignSingleTransformer} />
        </Layer>

        {/* Guide line/Tooltip */}
        <Layer id={"guide"} listening={false} draggable={false}>
          {/* Marquee selection rectangle */}
          {selectRect.visible && (
            <Rect
              x={selectRect.x}
              y={selectRect.y}
              width={selectRect.width}
              height={selectRect.height}
              fill={"rgba(51,153,255,0.15)"}
              stroke={"#3399ff"}
              strokeWidth={1}
              dash={[4, 4]}
            />
          )}
          <KonvaGuideLines ref={assignGuideLines} />
        </Layer>
      </Stage>

      {/* Alert */}
      <SnackbarAlert {...snackBarAlert} />
    </Box>
  );
});
