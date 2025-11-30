import { KonvaGridAPI, KonvaGrid } from "../../components/KonvaGrid";
import { SnackbarAlert } from "../../components/SnackbarAlert";
import { KonvaShape } from "../../components/KonvaShape";
import { createPathsFromSVG } from "../../utils/Shapes";
import { KonvaDragDrop } from "../../types/Konva";
import { useTranslation } from "react-i18next";
import { downloadFile } from "../../apis/file";
import { Stage, Layer } from "react-konva";
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
    dragStage,
    zoomStage,
    getIsStageDragable,
    setStageDragable,
    setPointerStyle,
    getStagePointerPosition,
    setStagePointerPosition,
    updateSnackbarAlert,
  } = useStageContext();

  const { selectedShape, updateShape, addShapes, updateSelectedIds } =
    useShapesContext();

  const { freeDrawingMode, setFreeDrawingMode } = useFreeDrawingContext();

  // Store is free drawing
  const freeDrawingInfoRef = React.useRef<FreeDrawingInfo>({
    previousMode: undefined,
    lines: undefined,
    isDrawing: false,
    shapeId: undefined,
  });

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
      freeDrawingInfoRef.current = {
        previousMode: freeDrawingMode,
        isDrawing: false,
        lines: selectedShape.lines,
        shapeId: selectedShape.lines ? selectedShape.id : nanoid(),
      };
    } else if (freeDrawingInfoRef.current.previousMode) {
      // Reset cursor style
      setPointerStyle();

      // Reset free drawing info
      freeDrawingInfoRef.current = {
        previousMode: undefined,
        lines: undefined,
        isDrawing: false,
        shapeId: undefined,
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

        if (freeDrawingInfo.previousMode) {
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
        } else if (e.target instanceof Konva.Stage) {
          // Reset selected ids
          updateSelectedIds({}, true);
        }
      }
    },
    [
      updateSelectedIds,
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

    if (freeDrawingInfo.isDrawing) {
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
        if (freeDrawingInfo.previousMode) {
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
      }
    },
    [updateShape, setStageDragable, setPointerStyle, getStagePointerPosition]
  );

  const handleStageClick = React.useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): void => {
      if (
        e.evt?.button === 0 &&
        !freeDrawingInfoRef.current.previousMode &&
        e.target instanceof Konva.Stage
      ) {
        // Reset selected ids
        updateSelectedIds({}, true);
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

        {/* Shapes */}
        <Layer id={"shapes"} listening={true} draggable={false}>
          <CanvasShapes />

          <KonvaTransformer ref={assignCropper} />

          <KonvaTransformer ref={assignTransformer} />
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
