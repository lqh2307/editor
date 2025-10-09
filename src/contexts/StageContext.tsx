import { KonvaGridStyle, KonvaGridAPI } from "../components/KonvaGrid";
import { KonvaTransformerAPI } from "../components/KonvaTransformer";
import { KonvaGuideLinesAPI } from "../components/KonvaGuideLines";
import { KonvaBackgroundAPI } from "../components/KonvaBackground";
import { SnackbarAlertProp } from "../components/SnackbarAlert";
import { detectContentTypeFromFormat } from "../utils/Utils";
import { ImageFormat } from "../types/Common";
import { IStageContext } from "./Interfaces";
import { WindowRect } from "../types/Window";
import { limitValue } from "../utils/Number";
import { StageProviderProp } from "./Types";
import { Vector2d } from "konva/lib/types";
import { AlertColor } from "@mui/material";
import { nanoid } from "nanoid";
import React from "react";
import Konva from "konva";

export const StageContext = React.createContext<IStageContext>({});

type StageState = {
  stageRatio: number;
  stageZoom: number;
  stageZoomMin: number;
  stageZoomMax: number;
  stageZoomStep: number;
  canvasWidth: number;
  canvasHeight: number;
  stageWidth: number;
  stageHeight: number;
};

type StageAction = {
  type:
    | "SET_RATIO"
    | "SET_ZOOM"
    | "SET_CANVAS_SIZE"
    | "FIT_SCREEN"
    | "DRAG"
    | "EXPAND"
    | "ZOOM";
  payload?: Ratio | SetZoom | SetCanvasSize | Fit | Drag | Expand | Zoom;
};

type Ratio = {
  stage: Konva.Stage;
  ratio: number;
};

type SetZoom = {
  stage: Konva.Stage;
  zoom: number;
  type: "max" | "min" | "step";
};

type SetCanvasSize = {
  stage: Konva.Stage;
  width: number;
  height: number;
};

type Zoom = {
  zoomOut: boolean;
  stage: Konva.Stage;
  pointer: boolean;
};

type Expand = {
  stage: Konva.Stage;
  newValue: number;
  targetHeight: boolean;
  newX: number;
  newY: number;
};

type Fit = {
  stage: Konva.Stage;
  resetZoom: boolean;
};

type Drag = {
  stage: Konva.Stage;
  lastPointerPosition: Vector2d;
};

function stageReducer(state: StageState, action: StageAction): StageState {
  switch (action.type) {
    case "FIT_SCREEN": {
      const fit: Fit = action.payload as Fit;

      const stage: Konva.Stage = fit.stage;
      if (!stage) {
        return state;
      }

      let newStageZoom: number;

      if (fit.resetZoom) {
        newStageZoom = 1;
      } else {
        const scaleX: number = state.canvasWidth / state.stageWidth;
        const scaleY: number = state.canvasHeight / state.stageHeight;

        newStageZoom = limitValue(
          scaleX < scaleY ? scaleX : scaleY,
          state.stageZoomMin,
          state.stageZoomMax
        );
      }

      stage.setAttrs({
        scaleX: newStageZoom,
        scaleY: newStageZoom,
        x: (state.canvasWidth - state.stageWidth * newStageZoom) / 2,
        y: (state.canvasHeight - state.stageHeight * newStageZoom) / 2,
      });

      return {
        ...state,
        stageZoom: newStageZoom,
      };
    }

    case "DRAG": {
      const drag: Drag = action.payload as Drag;

      const stage: Konva.Stage = drag.stage;
      if (!stage) {
        return state;
      }

      const pointer: Vector2d = stage.getPointerPosition();
      if (!pointer) {
        return state;
      }

      stage.setAttrs({
        x: stage.x() + pointer.x - drag.lastPointerPosition.x,
        y: stage.y() + pointer.y - drag.lastPointerPosition.y,
      });

      drag.lastPointerPosition.x = pointer.x;
      drag.lastPointerPosition.y = pointer.y;

      return state;
    }

    case "SET_RATIO": {
      const ratio: Ratio = action.payload as Ratio;

      const stage: Konva.Stage = ratio.stage;
      if (!stage) {
        return state;
      }

      const newHeight: number = state.stageWidth / ratio.ratio;

      stage.setAttrs({
        height: newHeight,
      });

      return {
        ...state,
        stageRatio: ratio.ratio,
        stageHeight: newHeight,
      };
    }

    case "SET_ZOOM": {
      const setZoom: SetZoom = action.payload as SetZoom;

      const stage: Konva.Stage = setZoom.stage;
      if (!stage) {
        return state;
      }

      if (setZoom.type === "step") {
        // New zoom step is cannot smaller than zoom min and larger than zoom max
        return {
          ...state,
          stageZoomStep: limitValue(
            setZoom.zoom,
            state.stageZoomMin,
            state.stageZoomMax
          ),
        };
      } else if (setZoom.type === "max") {
        // Zoom stage is cannot larger than new zoom max
        const stageZoom: number = limitValue(
          state.stageZoom,
          undefined,
          setZoom.zoom
        );

        stage.setAttrs({
          scaleX: stageZoom,
          scaleY: stageZoom,
        });

        return {
          ...state,
          stageZoom: stageZoom,
          stageZoomMax: setZoom.zoom,
          stageZoomMin: limitValue(state.stageZoomMin, undefined, setZoom.zoom),
        };
      } else {
        // Zoom stage is cannot smaller than new zoom min
        const stageZoom: number = limitValue(
          state.stageZoom,
          setZoom.zoom,
          undefined
        );

        stage.setAttrs({
          scaleX: stageZoom,
          scaleY: stageZoom,
        });

        return {
          ...state,
          stageZoom: stageZoom,
          stageZoomMax: limitValue(state.stageZoomMax, setZoom.zoom, undefined),
          stageZoomMin: setZoom.zoom,
        };
      }
    }

    case "SET_CANVAS_SIZE": {
      const setCanvasSize: SetCanvasSize = action.payload as SetCanvasSize;

      const stage = setCanvasSize.stage;
      if (!stage) {
        return state;
      }

      // const prevCx: number = state.canvasWidth / 2;
      // const prevCy: number = state.canvasHeight / 2;

      // const centerLogicX: number = (prevCx - stage.x()) / state.stageZoom;
      // const centerLogicY: number = (prevCy - stage.y()) / state.stageZoom;

      // stage.setAttrs({
      //   x: setCanvasSize.width / 2 - centerLogicX * state.stageZoom,
      //   y: setCanvasSize.height / 2 - centerLogicY * state.stageZoom,
      // });

      return {
        ...state,
        canvasWidth: setCanvasSize.width,
        canvasHeight: setCanvasSize.height,
      };
    }

    case "EXPAND": {
      const expand: Expand = action.payload as Expand;

      const stage: Konva.Stage = expand.stage;
      if (!stage) {
        return state;
      }

      let newWidth: number;
      let newHeight: number;

      if (expand.targetHeight) {
        newHeight = expand.newValue;

        newWidth = newHeight * state.stageRatio;
      } else {
        newWidth = expand.newValue;

        newHeight = newWidth / state.stageRatio;
      }

      stage.setAttrs({
        width: newWidth,
        height: newHeight,
        x: expand.newX ?? stage.x(),
        y: expand.newY ?? stage.y(),
      });

      return {
        ...state,
        stageWidth: newWidth,
        stageHeight: newHeight,
      };
    }

    case "ZOOM": {
      const zoom: Zoom = action.payload as Zoom;

      const stage: Konva.Stage = zoom.stage;
      if (!stage) {
        return state;
      }

      const oldZoom: number = stage.scaleX();

      const newZoom: number = limitValue(
        zoom.zoomOut
          ? stage.scaleX() - state.stageZoomStep
          : stage.scaleX() + state.stageZoomStep,
        state.stageZoomMin,
        state.stageZoomMax
      );

      if (zoom.pointer) {
        const pointer: Vector2d = stage.getPointerPosition();
        if (!pointer) {
          return state;
        }

        stage.setAttrs({
          scaleX: newZoom,
          scaleY: newZoom,
          x: pointer.x - (pointer.x - stage.x()) * (newZoom / oldZoom),
          y: pointer.y - (pointer.y - stage.y()) * (newZoom / oldZoom),
        });
      } else {
        stage.setAttrs({
          scaleX: newZoom,
          scaleY: newZoom,
          x: (state.canvasWidth - state.stageWidth * newZoom) / 2,
          y: (state.canvasHeight - state.stageHeight * newZoom) / 2,
        });
      }

      return {
        ...state,
        stageZoom: newZoom,
      };
    }

    default: {
      return state;
    }
  }
}

type BackgroundState = {
  fill: string;
  opacity: number;
};

type BackgroundAction = {
  type: "UPDATE_COLOR" | "UPDATE_OPACITY";
  payload?: UpdateBackgroundColor | UpdateBackgroundOpacity;
};

type UpdateBackgroundColor = {
  background: KonvaBackgroundAPI;
  fill: string;
};

type UpdateBackgroundOpacity = {
  background: KonvaBackgroundAPI;
  opacity: number;
};

function backgroundReducer(
  state: BackgroundState,
  action: BackgroundAction
): BackgroundState {
  switch (action.type) {
    case "UPDATE_COLOR": {
      const color: UpdateBackgroundColor =
        action.payload as UpdateBackgroundColor;

      color.background?.updateProp({
        fill: color.fill,
      });

      return {
        ...state,
        fill: color.fill,
      };
    }

    case "UPDATE_OPACITY": {
      const opacity: UpdateBackgroundOpacity =
        action.payload as UpdateBackgroundOpacity;

      opacity.background?.updateProp({
        opacity: opacity.opacity,
      });

      return {
        ...state,
        opacity: opacity.opacity,
      };
    }

    default: {
      return state;
    }
  }
}

type GridState = {
  style: KonvaGridStyle;
};

type GridAction = {
  type: "UPDATE_STYLE";
  payload?: UpdateGridStyle;
};

type UpdateGridStyle = {
  grid: KonvaGridAPI;
  style: KonvaGridStyle;
};

function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
    case "UPDATE_STYLE": {
      const style: UpdateGridStyle = action.payload as UpdateGridStyle;

      style.grid?.updateProp({
        style: style.style,
      });

      return {
        ...state,
        style: style.style,
      };
    }

    default: {
      return state;
    }
  }
}

export function StageProvider(prop: StageProviderProp): React.JSX.Element {
  // Store last pointer position
  const lastPointerPosition = React.useRef<Vector2d>(undefined);

  // Store background
  const backgroundRef = React.useRef<KonvaBackgroundAPI>(undefined);

  /**
   * Get background
   */
  const getBackground = React.useCallback((): KonvaBackgroundAPI => {
    return backgroundRef.current;
  }, []);

  /**
   * Set background
   */
  const setBackground = React.useCallback(
    (background: KonvaBackgroundAPI): void => {
      backgroundRef.current = background;

      background?.updateProp({
        id: "background",
        width: stageState.stageWidth,
        height: stageState.stageHeight,
        fill: backgroundState.fill,
        opacity: backgroundState.opacity,
      });
    },
    []
  );

  // Store grid
  const gridRef = React.useRef<KonvaGridAPI>(undefined);

  /**
   * Get grid
   */
  const getGrid = React.useCallback((): KonvaGridAPI => {
    return gridRef.current;
  }, []);

  /**
   * Set grid
   */
  const setGrid = React.useCallback((grid: KonvaGridAPI): void => {
    gridRef.current = grid;

    grid?.updateProp({
      id: "grid",
      width: stageState.stageWidth,
      height: stageState.stageHeight,
      style: gridState.style,
      gap: 25,
      stroke: "#646464",
      opacity: 0.75,
      strokeWidth: 1,
    });
  }, []);

  // Store stage
  const stageRef = React.useRef<Konva.Stage>(undefined);

  /**
   * Get stage
   */
  const getStage = React.useCallback((): Konva.Stage => {
    return stageRef.current;
  }, []);

  /**
   * Set stage
   */
  const setStage = React.useCallback((stage: Konva.Stage): void => {
    stageRef.current = stage;

    stage?.setAttrs({
      width: prop.stageWidth,
      height: prop.stageHeight,
      scaleX: prop.stageZoom,
      scaleY: prop.stageZoom,
      x: (prop.canvasWidth - prop.stageWidth * prop.stageZoom) / 2,
      y: (prop.canvasHeight - prop.stageHeight * prop.stageZoom) / 2,
    });
  }, []);

  // Store transformer
  const transformerRef = React.useRef<KonvaTransformerAPI>(undefined);

  /**
   * Get transformer
   */
  const getTransformer = React.useCallback((): KonvaTransformerAPI => {
    return transformerRef.current;
  }, []);

  /**
   * Set transformer
   */
  const setTransformer = React.useCallback(
    (transformer: KonvaTransformerAPI): void => {
      transformerRef.current = transformer;

      transformer?.updateProp({
        id: "transformer",
        keepRatio: true,
        rotationSnaps: [
          -180, -165, -150, -135, -120, -105, -90, -75, -60, -45, -30, -15, 0,
          15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180,
        ],
        rotationSnapTolerance: 3,
        ignoreStroke: false,
        flipEnabled: true,
        borderStroke: "#ff0000",
        borderStrokeWidth: 1.5,
        borderDash: [20, 10],
        enabledAnchors: [
          "top-left",
          "top-center",
          "top-right",
          "middle-right",
          "middle-left",
          "bottom-left",
          "bottom-center",
          "bottom-right",
        ],
        anchorStyleFunc: (anchor) => {
          if (anchor.hasName("top-center") || anchor.hasName("bottom-center")) {
            anchor.setAttrs({
              fill: "#ffA500",
              stroke: "#ff0000",
              strokeWidth: 1,
              cornerRadius: 5,
              height: 8,
              offsetY: 4,
              width: 40,
              offsetX: 20,
            });
          } else if (
            anchor.hasName("middle-left") ||
            anchor.hasName("middle-right")
          ) {
            anchor.setAttrs({
              fill: "#ffA500",
              stroke: "#ff0000",
              strokeWidth: 1,
              cornerRadius: 5,
              height: 40,
              offsetY: 20,
              width: 8,
              offsetX: 4,
            });
          } else if (anchor.hasName("rotater")) {
            anchor.setAttrs({
              fill: "#ffA500",
              stroke: "#ff0000",
              strokeWidth: 1.5,
              cornerRadius: 10,
              height: 20,
              offsetY: 10,
              width: 20,
              offsetX: 10,
            });
          } else {
            anchor.setAttrs({
              fill: "#ffA500",
              stroke: "#ff0000",
              strokeWidth: 1,
              cornerRadius: 5,
              height: 10,
              offsetY: 5,
              width: 10,
              offsetX: 5,
            });
          }
        },
      });
    },
    []
  );

  // Store guideLines
  const guideLinesRef = React.useRef<KonvaGuideLinesAPI>(undefined);

  /**
   * Get guide lines
   */
  const getGuideLines = React.useCallback((): KonvaGuideLinesAPI => {
    return guideLinesRef.current;
  }, []);

  /**
   * Set guide lines
   */
  const setGuideLines = React.useCallback(
    (guideLines: KonvaGuideLinesAPI): void => {
      guideLinesRef.current = guideLines;

      guideLines?.updateProp({
        id: "guideLines",
        style: "dotted",
        strokeWidth: 1.5,
        stroke: "#ff0000",
        opacity: 0.75,
      });
    },
    []
  );

  // Store stage info
  const [stageState, stageDispatch] = React.useReducer(stageReducer, {
    stageRatio: prop.stageRatio,
    stageZoom: prop.stageZoom,
    stageZoomMin: prop.stageZoomMin,
    stageZoomMax: prop.stageZoomMax,
    stageZoomStep: prop.stageZoomStep,
    canvasWidth: prop.canvasWidth,
    canvasHeight: prop.canvasHeight,
    stageWidth: prop.stageWidth,
    stageHeight: prop.stageHeight,
  });

  // Store background info
  const [backgroundState, backgroundDispatch] = React.useReducer(
    backgroundReducer,
    {
      fill: "#ffffff",
      opacity: 1,
    }
  );

  // Store grid info
  const [gridState, gridDispatch] = React.useReducer(gridReducer, {
    style: "none" as KonvaGridStyle,
  });

  // Snackbar alert
  const [snackBarAlert, setSnackbarAlert] =
    React.useState<SnackbarAlertProp>(undefined);

  /**
   * Set pointer style
   */
  const setPointerStyle = React.useCallback((style?: string): void => {
    const stageStyle: CSSStyleDeclaration =
      stageRef.current?.container()?.style;
    if (stageStyle) {
      stageStyle.cursor = style ? style : "default";
    }
  }, []);

  /**
   * Drag stage
   */
  const dragStage = React.useCallback((): void => {
    stageDispatch({
      type: "DRAG",
      payload: {
        stage: stageRef.current,
        lastPointerPosition: lastPointerPosition.current,
      },
    });
  }, []);

  /**
   * Zoom stage
   */
  const zoomStage = React.useCallback(
    (zoomOut: boolean, pointer?: boolean): void => {
      stageDispatch({
        type: "ZOOM",
        payload: {
          stage: stageRef.current,
          zoomOut: zoomOut,
          pointer: pointer,
        },
      });
    },
    []
  );

  /**
   * Set canvas size
   */
  const setCanvasSize = React.useCallback(
    (width: number, height: number): void => {
      stageDispatch({
        type: "SET_CANVAS_SIZE",
        payload: {
          stage: stageRef.current,
          width: width,
          height: height,
        },
      });
    },
    []
  );

  /**
   * Fit stage
   */
  const fitStageScreen = React.useCallback((resetZoom?: boolean): void => {
    stageDispatch({
      type: "FIT_SCREEN",
      payload: {
        stage: stageRef.current,
        resetZoom: resetZoom,
      },
    });
  }, []);

  /**
   * Set stage zoom
   */
  const setStageZoom = React.useCallback(
    (zoom: number, type?: "min" | "max" | "step"): void => {
      stageDispatch({
        type: "SET_ZOOM",
        payload: {
          stage: stageRef.current,
          zoom: zoom,
          type: type,
        },
      });
    },
    []
  );

  /**
   * Set stage ratio
   */
  const setStageRatio = React.useCallback((ratio: number): void => {
    stageDispatch({
      type: "SET_RATIO",
      payload: {
        stage: stageRef.current,
        ratio: ratio,
      },
    });
  }, []);

  /**
   * Expand stage
   */
  const expandStage = React.useCallback(
    (
      newValue: number,
      targetHeight?: boolean,
      newX?: number,
      newY?: number
    ): void => {
      stageDispatch({
        type: "EXPAND",
        payload: {
          stage: stageRef.current,
          newValue: newValue,
          targetHeight: targetHeight,
          newX: newX,
          newY: newY,
        },
      });
    },
    []
  );

  /**
   * Export stage
   */
  const exportStage = React.useCallback(
    (format?: ImageFormat, crop?: boolean): string => {
      const stage: Konva.Stage = stageRef.current;
      if (!stage) {
        return;
      }

      format = format || "png";
      const mimeType: string = detectContentTypeFromFormat(format);

      const opt: any = {
        x: stage.x(),
        y: stage.y(),
        width: stage.width(),
        height: stage.height(),
        mimeType: mimeType,
      };

      if (crop) {
        const box: WindowRect = stage.find("#shapes")?.[0]?.getClientRect({
          skipTransform: false,
          skipShadow: false,
          skipStroke: false,
        });
        if (box) {
          Object.assign(opt, box);
        }
      }

      return stage.toDataURL(opt);
    },
    []
  );

  /**
   * Get stage center position
   */
  const getStageCenter = React.useCallback((): Vector2d => {
    const stage: Konva.Stage = stageRef.current;
    if (!stage) {
      return;
    }

    const position: Vector2d = stage
      .getAbsoluteTransform()
      .copy()
      .invert()
      .point(stage.position());

    return {
      x: stage.width() / 2 - position.x,
      y: stage.height() / 2 - position.y,
    };
  }, []);

  /**
   * Get stage pointer position
   */
  const getStagePointerPosition = React.useCallback((id?: string): Vector2d => {
    const stage: Konva.Stage = stageRef.current;
    if (!stage) {
      return;
    }

    if (id) {
      return stage.findOne<Konva.Node>(`#${id}`)?.getRelativePointerPosition();
    } else {
      return stage.getRelativePointerPosition();
    }
  }, []);

  /**
   * Set stage pointer position
   */
  const setStagePointerPosition = React.useCallback((event: any): void => {
    const stage: Konva.Stage = stageRef.current;
    if (!stage) {
      return;
    }

    stage.setPointersPositions(event);
  }, []);

  /**
   * Set stage dragable
   */
  const setStageDragable = React.useCallback((dragable: boolean): void => {
    const stage: Konva.Stage = stageRef.current;
    if (!stage) {
      return;
    }

    if (dragable) {
      stage.draggable(true);

      lastPointerPosition.current = stage.getPointerPosition();
    } else {
      stage.draggable(false);

      lastPointerPosition.current = undefined;
    }
  }, []);

  /**
   * Get is dragable
   */
  const getIsStageDragable = React.useCallback((): boolean => {
    return !!lastPointerPosition.current;
  }, []);

  /**
   * Update background color
   */
  const updateBackgroundColor = React.useCallback((color: string): void => {
    backgroundDispatch({
      type: "UPDATE_COLOR",
      payload: {
        background: backgroundRef.current,
        fill: color,
      },
    });
  }, []);

  /**
   * Update background opacity
   */
  const updateBackgroundOpacity = React.useCallback((opacity: number): void => {
    backgroundDispatch({
      type: "UPDATE_OPACITY",
      payload: {
        background: backgroundRef.current,
        opacity: opacity,
      },
    });
  }, []);

  /**
   * Update grid style
   */
  const updateGridStyle = React.useCallback((style: KonvaGridStyle): void => {
    gridDispatch({
      type: "UPDATE_STYLE",
      payload: {
        grid: gridRef.current,
        style: style,
      },
    });
  }, []);

  /**
   * Update snackbar alert
   */
  const updateSnackbarAlert = React.useCallback(
    (message: string, severity: AlertColor): void => {
      setSnackbarAlert({
        autoHideDuration: 1000,
        open: true,
        severity: severity,
        message: message,
        id: nanoid(),
      });
    },
    []
  );

  React.useEffect(() => {
    /**
     * Resize handler
     */
    function resizeHandler() {
      setCanvasSize(innerWidth, innerHeight);
    }

    addEventListener("resize", resizeHandler);

    return () => {
      removeEventListener("resize", resizeHandler);
    };
  }, []);

  // Update background/grid size
  React.useEffect(() => {
    backgroundRef.current?.updateProp({
      width: stageState.stageWidth,
      height: stageState.stageHeight,
    });

    gridRef.current?.updateProp({
      width: stageState.stageWidth,
      height: stageState.stageHeight,
    });
  }, [stageState.stageWidth, stageState.stageHeight]);

  const contextValue = React.useMemo<IStageContext>(
    () => ({
      canvasWidth: stageState.canvasWidth,
      canvasHeight: stageState.canvasHeight,
      stageZoom: stageState.stageZoom,
      stageZoomMin: stageState.stageZoomMin,
      stageZoomMax: stageState.stageZoomMax,
      stageZoomStep: stageState.stageZoomStep,
      stageWidth: stageState.stageWidth,
      stageHeight: stageState.stageHeight,

      stageRatio: stageState.stageRatio,
      setStageRatio,

      setStageZoom,
      zoomStage,

      dragStage,
      fitStageScreen,
      setPointerStyle,
      expandStage,
      exportStage,
      getStageCenter,
      getStagePointerPosition,
      setStagePointerPosition,
      getIsStageDragable,
      setStageDragable,
      setCanvasSize,

      getStage,
      setStage,

      getTransformer,
      setTransformer,

      getGuideLines,
      setGuideLines,

      backgroundColor: backgroundState.fill,
      backgroundOpacity: backgroundState.opacity,
      getBackground,
      setBackground,
      updateBackgroundColor,
      updateBackgroundOpacity,

      gridStyle: gridState.style,
      getGrid,
      setGrid,
      updateGridStyle,

      snackBarAlert,
      updateSnackbarAlert,
    }),
    [stageState, backgroundState, gridState, snackBarAlert]
  );

  return (
    <StageContext.Provider value={contextValue}>
      {prop.children}
    </StageContext.Provider>
  );
}

export function useStageContext(): IStageContext {
  return React.useContext(StageContext);
}
