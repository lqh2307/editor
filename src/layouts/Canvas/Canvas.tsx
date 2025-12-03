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
  KonvaTFM,
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
    dragStage,
    zoomStage,
    getIsStageDragable,
    setStageDragable,
    setPointerStyle,
    getStagePointerPosition,
    setStagePointerPosition,
    updateSnackbarAlert,
  } = useStageContext();

  const {
    selectedShape,
    updateShape,
    addShapes,
    updateSelectedIds,
    transformerRefs,
    // singleSelectedIds,
    // selectedIds,
  } = useShapesContext();

  const { freeDrawingMode, setFreeDrawingMode } = useFreeDrawingContext();

  // Store is free drawing
  const freeDrawingInfoRef = React.useRef<FreeDrawingInfo>({
    previousMode: undefined,
    lines: undefined,
    isDrawing: false,
    shapeId: undefined,
  });

  // const nodesRef = React.useRef<Konva.Node[]>(undefined);

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

  const cropperOptionRef = React.useRef<KonvaTFM>({
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
  });

  const transformerOptionRef = React.useRef<KonvaTFM>({
    id: "transformer",
    keepRatio: true,
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
  });

  const singleTransformerOptionRef = React.useRef<KonvaTFM>({
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
  });

  const assignTransformer = React.useCallback(
    (id?: string, transformer?: KonvaTransformerAPI): void => {
      if (!transformerRefs[id]) {
        transformerRefs[id] = transformer;
      }
    },
    [transformerRefs]
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
          updateSelectedIds(undefined, true);
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
        updateSelectedIds(undefined, true);
      }
    },
    [updateSelectedIds]
  );

  // const handleShapeDragStart = React.useCallback(
  //   (shapeAPI: KonvaTransformerAPI): void => {
  //     const id: string = shapeAPI.getTransformer().id;

  //     if (id === "single-transformer") {
  //       const transformer: Konva.Transformer =
  //         transformerRefs["transformer"].getNode();

  //       nodesRef.current = transformer.nodes();

  //       transformer.nodes([]);
  //     } else if (id === "transformer") {
  //       const transformer: Konva.Transformer =
  //         transformerRefs["single-transformer"].getNode();

  //       nodesRef.current = transformer.nodes();

  //       transformer.nodes([]);
  //     }
  //   },
  //   [transformerRefs, selectedIds, singleSelectedIds]
  // );

  // const handleShapeDragEnd = React.useCallback(
  //   (shapeAPI: KonvaTransformerAPI): void => {
  //     const id: string = shapeAPI.getTransformer().id;
  //     const transformer: Konva.Transformer = shapeAPI.getNode();
  //     const nodes: Konva.Node[] = transformer.nodes();

  //     if (id === "single-transformer" && nodes.length) {
  //       const otherTransformer: Konva.Transformer =
  //         transformerRefs["transformer"].getNode();

  //       otherTransformer.nodes(nodesRef.current);

  //       nodesRef.current = undefined;
  //     } else if (id === "transformer" && nodes.length) {
  //       const transformer: Konva.Transformer =
  //         transformerRefs["single-transformer"].getNode();

  //       transformer.nodes(nodesRef.current);

  //       nodesRef.current = undefined;
  //     }
  //   },
  //   [transformerRefs, selectedIds, singleSelectedIds]
  // );

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

          <KonvaTransformer
            transformerOption={cropperOptionRef.current}
            onMounted={assignTransformer}
          />

          <KonvaTransformer
            transformerOption={transformerOptionRef.current}
            onMounted={assignTransformer}
            // onDragStart={handleShapeDragStart}
            // onDragEnd={handleShapeDragEnd}
          />

          <KonvaTransformer
            transformerOption={singleTransformerOptionRef.current}
            onMounted={assignTransformer}
            // onDragStart={handleShapeDragStart}
            // onDragEnd={handleShapeDragEnd}
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
