import { KonvaGridStyle, KonvaGridAPI } from "../components/KonvaGrid";
import { KonvaGuideLinesAPI } from "../components/KonvaGuideLines";
import { KonvaBackgroundAPI } from "../components/KonvaBackground";
import { SnackbarAlertProp } from "../components/SnackbarAlert";
import { detectContentTypeFromFormat } from "../utils/Utils";
import { DrawingMode } from "../types/FreeDrawing";
import { useTranslation } from "react-i18next";
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

type State = {
  backgroundColor: string;
  backgroundOpacity: number;

  gridStyle: KonvaGridStyle;

  guideLinesThreshold: number;
  guideLinesStick: boolean;

  language: string;

  panelWidth: number;
  panelColor: string;

  canvasColor: string;

  toolbarHeight: number;
  toolbarColor: string;

  stageMinWidth: number;
  stageRatio: number;
  stageZoomMin: number;
  stageZoomMax: number;
  stageZoomStep: number;
  stageZoom: number;
  stageWidth: number;
  stageHeight: number;
};

type SetBackgroundColor = {
  background: KonvaBackgroundAPI;
  color: string;
};

type SetBackgroundOpacity = {
  background: KonvaBackgroundAPI;
  opacity: number;
};

type SetGridStyle = {
  grid: KonvaGridAPI;
  style: KonvaGridStyle;
};

type SetToolbarHeight = {
  stage: Konva.Stage;
  height: number;
};

type SetPanelWidth = {
  stage: Konva.Stage;
  width: number;
};

type SetStageMinWidth = {
  stage: Konva.Stage;
  width: number;
};

type SetStageRatio = {
  stage: Konva.Stage;
  ratio: number;
};

type SetZoomStage = {
  stage: Konva.Stage;
  zoom: number;
  type: "max" | "min" | "step";
};

type ZoomStage = {
  stage: Konva.Stage;
  zoomOut: boolean;
  pointer: boolean;
};

type ExpandStage = {
  stage: Konva.Stage;
  value: number;
  targetHeight: boolean;
  position: Vector2d;
};

type FitStage = {
  stage: Konva.Stage;
  resetZoom: boolean;
};

type DragStage = {
  stage: Konva.Stage;
  lastPointerPosition: Vector2d;
};

type StageAction = {
  type:
    | "SET_LANGUAGE"
    | "SET_STAGE_MIN_WIDTH"
    | "SET_GUIDE_LINES_THRESHOLD"
    | "SET_GUIDE_LINES_STICK"
    | "SET_BACKGROUND_COLOR"
    | "SET_BACKGROUND_OPACITY"
    | "SET_GRID_STYLE"
    | "SET_PANEL_WIDTH"
    | "SET_PANEL_COLOR"
    | "SET_CANVAS_COLOR"
    | "SET_TOOLBAR_HEIGHT"
    | "SET_TOOLBAR_COLOR"
    | "SET_ZOOM_STAGE"
    | "SET_STAGE_RATIO"
    | "FIT_STAGE"
    | "DRAG_STAGE"
    | "EXPAND_STAGE"
    | "ZOOM_STAGE";
  payload?:
    | boolean
    | number
    | string
    | SetToolbarHeight
    | SetPanelWidth
    | SetStageMinWidth
    | SetStageRatio
    | SetBackgroundColor
    | SetBackgroundOpacity
    | SetGridStyle
    | SetZoomStage
    | FitStage
    | DragStage
    | ExpandStage
    | ZoomStage;
};

function reducer(state: State, action: StageAction): State {
  switch (action.type) {
    case "SET_LANGUAGE": {
      return {
        ...state,
        language: action.payload as string,
      };
    }

    case "SET_BACKGROUND_COLOR": {
      const backgroundColor: SetBackgroundColor =
        action.payload as SetBackgroundColor;

      const background: KonvaBackgroundAPI = backgroundColor.background;
      if (!background) {
        return state;
      }

      background.updateProp({
        fill: backgroundColor.color,
      });

      return {
        ...state,
        backgroundColor: backgroundColor.color,
      };
    }

    case "SET_BACKGROUND_OPACITY": {
      const backgroundOpacity: SetBackgroundOpacity =
        action.payload as SetBackgroundOpacity;

      const background: KonvaBackgroundAPI = backgroundOpacity.background;
      if (!background) {
        return state;
      }

      background.updateProp({
        opacity: backgroundOpacity.opacity,
      });

      return {
        ...state,
        backgroundOpacity: backgroundOpacity.opacity,
      };
    }

    case "SET_GRID_STYLE": {
      const gridStyle: SetGridStyle = action.payload as SetGridStyle;

      const grid: KonvaGridAPI = gridStyle.grid;
      if (!grid) {
        return state;
      }

      grid.updateProp({
        style: gridStyle.style,
      });

      return {
        ...state,
        gridStyle: gridStyle.style,
      };
    }

    case "SET_GUIDE_LINES_THRESHOLD": {
      return {
        ...state,
        guideLinesThreshold: action.payload as number,
      };
    }

    case "SET_GUIDE_LINES_STICK": {
      return {
        ...state,
        guideLinesStick: action.payload as boolean,
      };
    }

    case "SET_PANEL_WIDTH": {
      const panelWidth: SetPanelWidth = action.payload as SetPanelWidth;

      const stage: Konva.Stage = panelWidth.stage;
      if (!stage) {
        return state;
      }

      const width: number = innerWidth - state.panelWidth;
      const height: number = innerHeight - state.toolbarHeight;

      const scaleX: number = width / state.stageWidth;
      const scaleY: number = height / state.stageHeight;

      const newStageZoom = limitValue(
        scaleX < scaleY ? scaleX : scaleY,
        state.stageZoomMin,
        state.stageZoomMax
      );

      stage.setAttrs({
        scaleX: newStageZoom,
        scaleY: newStageZoom,
        x: (width - state.stageWidth * newStageZoom) / 2,
        y: (height - state.stageHeight * newStageZoom) / 2,
      });

      return {
        ...state,
        stageZoom: newStageZoom,
        panelWidth: panelWidth.width,
      };
    }

    case "SET_PANEL_COLOR": {
      return {
        ...state,
        panelColor: action.payload as string,
      };
    }

    case "SET_CANVAS_COLOR": {
      return {
        ...state,
        canvasColor: action.payload as string,
      };
    }

    case "SET_TOOLBAR_HEIGHT": {
      const toolbarHeight: SetToolbarHeight =
        action.payload as SetToolbarHeight;

      const stage: Konva.Stage = toolbarHeight.stage;
      if (!stage) {
        return state;
      }

      const width: number = innerWidth - state.panelWidth;
      const height: number = innerHeight - state.toolbarHeight;

      const scaleX: number = width / state.stageWidth;
      const scaleY: number = height / state.stageHeight;

      const newStageZoom = limitValue(
        scaleX < scaleY ? scaleX : scaleY,
        state.stageZoomMin,
        state.stageZoomMax
      );

      stage.setAttrs({
        scaleX: newStageZoom,
        scaleY: newStageZoom,
        x: (width - state.stageWidth * newStageZoom) / 2,
        y: (height - state.stageHeight * newStageZoom) / 2,
      });

      return {
        ...state,
        stageZoom: newStageZoom,
        toolbarHeight: toolbarHeight.height,
      };
    }

    case "SET_TOOLBAR_COLOR": {
      return {
        ...state,
        toolbarColor: action.payload as string,
      };
    }

    case "FIT_STAGE": {
      const fit: FitStage = action.payload as FitStage;

      const stage: Konva.Stage = fit.stage;
      if (!stage) {
        return state;
      }

      const width: number = innerWidth - state.panelWidth;
      const height: number = innerHeight - state.toolbarHeight;
      let newStageZoom: number;

      if (fit.resetZoom) {
        newStageZoom = 1;
      } else {
        const scaleX: number = width / state.stageWidth;
        const scaleY: number = height / state.stageHeight;

        newStageZoom = limitValue(
          scaleX < scaleY ? scaleX : scaleY,
          state.stageZoomMin,
          state.stageZoomMax
        );
      }

      stage.setAttrs({
        scaleX: newStageZoom,
        scaleY: newStageZoom,
        x: (width - state.stageWidth * newStageZoom) / 2,
        y: (height - state.stageHeight * newStageZoom) / 2,
      });

      return {
        ...state,
        stageZoom: newStageZoom,
      };
    }

    case "DRAG_STAGE": {
      const drag: DragStage = action.payload as DragStage;

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

    case "SET_STAGE_MIN_WIDTH": {
      const minWidth: SetStageMinWidth = action.payload as SetStageMinWidth;

      const stage: Konva.Stage = minWidth.stage;
      if (!stage) {
        return state;
      }

      // Width stage is cannot smaller than new stage min width
      const stageWidth: number = Math.round(
        limitValue(state.stageWidth, minWidth.width, undefined)
      );

      const stageHeight: number = Math.round(stageWidth / state.stageRatio);

      stage.setAttrs({
        width: stageWidth,
        height: stageHeight,
      });

      return {
        ...state,
        stageMinWidth: minWidth.width,
        stageWidth: stageWidth,
        stageHeight: stageHeight,
      };
    }

    case "SET_STAGE_RATIO": {
      const ratio: SetStageRatio = action.payload as SetStageRatio;

      const stage: Konva.Stage = ratio.stage;
      if (!stage) {
        return state;
      }

      const stageHeight: number = Math.round(state.stageWidth / ratio.ratio);

      stage.setAttrs({
        height: stageHeight,
      });

      return {
        ...state,
        stageRatio: ratio.ratio,
        stageHeight: stageHeight,
      };
    }

    case "SET_ZOOM_STAGE": {
      const setZoom: SetZoomStage = action.payload as SetZoomStage;

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

    case "EXPAND_STAGE": {
      const expand: ExpandStage = action.payload as ExpandStage;

      const stage: Konva.Stage = expand.stage;
      if (!stage) {
        return state;
      }

      let newWidth: number;
      let newHeight: number;
      const ratio: number = state.stageRatio;
      const position: Vector2d = expand.position ?? stage.position();

      if (expand.targetHeight) {
        newHeight = expand.value;

        newWidth = Math.round(newHeight * ratio);
      } else {
        newWidth = expand.value;

        newHeight = Math.round(newWidth / ratio);
      }

      stage.setAttrs({
        width: newWidth,
        height: newHeight,
        x: position.x,
        y: position.y,
      });

      return {
        ...state,
        stageWidth: newWidth,
        stageHeight: newHeight,
      };
    }

    case "ZOOM_STAGE": {
      const zoom: ZoomStage = action.payload as ZoomStage;

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
          x: (innerWidth - state.panelWidth - state.stageWidth * newZoom) / 2,
          y:
            (innerHeight - state.toolbarHeight - state.stageHeight * newZoom) /
            2,
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

export function StageProvider(prop: StageProviderProp): React.JSX.Element {
  const { i18n } = useTranslation();

  // Store stage info
  const [state, dispatch] = React.useReducer(reducer, {
    backgroundColor: prop.backGroundColor,
    backgroundOpacity: prop.backgroundOpacity,
    gridStyle: prop.gridStyle,

    guideLinesThreshold: prop.guideLinesThreshold,
    guideLinesStick: prop.guideLinesStick,

    language: prop.language,

    panelWidth: prop.panelWidth,
    panelColor: prop.panelColor,

    canvasColor: prop.canvasColor,

    toolbarHeight: prop.toolbarHeight,
    toolbarColor: prop.toolbarColor,

    stageMinWidth: prop.stageMinWidth,
    stageRatio: prop.stageRatio,
    stageZoomMin: prop.stageZoomMin,
    stageZoomMax: prop.stageZoomMax,
    stageZoomStep: prop.stageZoomStep,
    stageZoom: prop.stageZoom,
    stageWidth: prop.stageWidth,
    stageHeight: prop.stageHeight,
  });

  /**
   * Set language
   */
  const setLanguage = React.useCallback(
    (lang: string): void => {
      i18n.changeLanguage(lang, () => {
        dispatch({
          type: "SET_LANGUAGE",
          payload: lang,
        });
      });
    },
    [i18n]
  );

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
        width: state.stageWidth,
        height: state.stageHeight,
        fill: state.backgroundColor,
        opacity: state.backgroundOpacity,
      });
    },
    [state]
  );

  /**
   * Set background color
   */
  const setBackgroundColor = React.useCallback((color: string): void => {
    dispatch({
      type: "SET_BACKGROUND_COLOR",
      payload: {
        background: backgroundRef.current,
        color: color,
      },
    });
  }, []);

  /**
   * Set background opacity
   */
  const setBackgroundOpacity = React.useCallback((opacity: number): void => {
    dispatch({
      type: "SET_BACKGROUND_OPACITY",
      payload: {
        background: backgroundRef.current,
        opacity: opacity,
      },
    });
  }, []);

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
  const setGrid = React.useCallback(
    (grid: KonvaGridAPI): void => {
      gridRef.current = grid;

      grid?.updateProp({
        id: "grid",
        width: state.stageWidth,
        height: state.stageHeight,
        style: state.gridStyle,
        gap: 25,
        stroke: "#646464",
        opacity: 0.75,
        strokeWidth: 1,
      });
    },
    [state]
  );

  /**
   * Set grid style
   */
  const setGridStyle = React.useCallback((style: KonvaGridStyle): void => {
    dispatch({
      type: "SET_GRID_STYLE",
      payload: {
        grid: gridRef.current,
        style: style,
      },
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
  const setStage = React.useCallback(
    (stage: Konva.Stage): void => {
      stageRef.current = stage;

      stage?.setAttrs({
        width: state.stageWidth,
        height: state.stageHeight,
        scaleX: state.stageZoom,
        scaleY: state.stageZoom,
        x:
          (innerWidth - state.panelWidth - state.stageWidth * state.stageZoom) /
          2,
        y:
          (innerHeight -
            state.toolbarHeight -
            state.stageHeight * state.stageZoom) /
          2,
      });
    },
    [state]
  );

  /**
   * Set stage min width
   */
  const setStageMinWidth = React.useCallback((width: number): void => {
    dispatch({
      type: "SET_STAGE_MIN_WIDTH",
      payload: {
        stage: stageRef.current,
        width: width,
      },
    });
  }, []);

  /**
   * Set stage ratio
   */
  const setStageRatio = React.useCallback((ratio: number): void => {
    dispatch({
      type: "SET_STAGE_RATIO",
      payload: {
        stage: stageRef.current,
        ratio: ratio,
      },
    });
  }, []);

  /**
   * Drag stage
   */
  const dragStage = React.useCallback((): void => {
    dispatch({
      type: "DRAG_STAGE",
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
      dispatch({
        type: "ZOOM_STAGE",
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
   * Fit stage
   */
  const fitStage = React.useCallback((resetZoom?: boolean): void => {
    dispatch({
      type: "FIT_STAGE",
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
      dispatch({
        type: "SET_ZOOM_STAGE",
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
   * Expand stage
   */
  const expandStage = React.useCallback(
    (value: number, targetHeight?: boolean, position?: Vector2d): void => {
      dispatch({
        type: "EXPAND_STAGE",
        payload: {
          stage: stageRef.current,
          value: value,
          targetHeight: targetHeight,
          position: position,
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
        const box: WindowRect = stage.findOne("#shapes")?.getClientRect({
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

    return {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };
  }, []);

  /**
   * Set stage dragable
   */
  const setStageDragable = React.useCallback((dragable: boolean): void => {
    const stage: Konva.Stage = stageRef.current;
    if (!stage) {
      return;
    }

    stage.draggable(dragable);

    lastPointerPosition.current = dragable
      ? stage.getPointerPosition()
      : undefined;
  }, []);

  /**
   * Get is dragable
   */
  const getIsStageDragable = React.useCallback((): boolean => {
    return !!lastPointerPosition.current;
  }, []);

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
        id: "guide-lines",
        style: "dotted",
        strokeWidth: 1.5,
        stroke: "#ff0000",
        opacity: 0.75,
      });
    },
    []
  );

  /**
   * Set guide lines threshold
   */
  const setGuideLinesThreshold = React.useCallback(
    (threshold: number): void => {
      dispatch({
        type: "SET_GUIDE_LINES_THRESHOLD",
        payload: threshold,
      });
    },
    []
  );

  /**
   * Set guide lines stick
   */
  const setGuideLinesStick = React.useCallback((stick: boolean): void => {
    dispatch({
      type: "SET_GUIDE_LINES_STICK",
      payload: stick,
    });
  }, []);

  /**
   * Set panel width
   */
  const setPanelWidth = React.useCallback((width: number): void => {
    dispatch({
      type: "SET_PANEL_WIDTH",
      payload: {
        stage: stageRef.current,
        width: width,
      },
    });
  }, []);

  /**
   * Set panel coler
   */
  const setPanelColor = React.useCallback((color: string): void => {
    dispatch({
      type: "SET_PANEL_COLOR",
      payload: color,
    });
  }, []);

  /**
   * Set canvas coler
   */
  const setCanvasColor = React.useCallback((color: string): void => {
    dispatch({
      type: "SET_CANVAS_COLOR",
      payload: color,
    });
  }, []);

  /**
   * Set toolbar height
   */
  const setToolbarHeight = React.useCallback((height: number): void => {
    dispatch({
      type: "SET_TOOLBAR_HEIGHT",
      payload: {
        stage: stageRef.current,
        height: height,
      },
    });
  }, []);

  /**
   * Set toolbar coler
   */
  const setToolbarColor = React.useCallback((color: string): void => {
    dispatch({
      type: "SET_TOOLBAR_COLOR",
      payload: color,
    });
  }, []);

  // Store last pointer position
  const lastPointerPosition = React.useRef<Vector2d>(undefined);

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
   * Set pointer style
   */
  const setPointerStyle = React.useCallback((style?: string): void => {
    const stageStyle: CSSStyleDeclaration =
      stageRef.current?.container()?.style;
    if (stageStyle) {
      stageStyle.cursor = style ? style : "default";
    }
  }, []);

  // Snackbar alert
  const [snackBarAlert, setSnackbarAlert] =
    React.useState<SnackbarAlertProp>(undefined);

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

  // Store drawing mode
  const [drawingMode, setDrawingMode] = React.useState<DrawingMode>(undefined);

  // Update background/grid size
  React.useEffect(() => {
    backgroundRef.current?.updateProp({
      width: state.stageWidth,
      height: state.stageHeight,
    });

    gridRef.current?.updateProp({
      width: state.stageWidth,
      height: state.stageHeight,
    });
  }, [state.stageWidth, state.stageHeight]);

  // Update if canvas size is changed
  React.useEffect(() => {
    function resizeHandler() {
      fitStage();
    }

    addEventListener("resize", resizeHandler);

    return () => {
      removeEventListener("resize", resizeHandler);
    };
  }, []);

  const contextValue: IStageContext = React.useMemo<IStageContext>(
    () => ({
      setLanguage,

      setPanelWidth,
      setPanelColor,

      setCanvasColor,

      setToolbarHeight,
      setToolbarColor,

      backgroundColor: state.backgroundColor,
      backgroundOpacity: state.backgroundOpacity,

      gridStyle: state.gridStyle,

      guideLinesThreshold: state.guideLinesThreshold,
      guideLinesStick: state.guideLinesStick,

      language: state.language,

      panelWidth: state.panelWidth,
      panelColor: state.panelColor,

      canvasColor: state.canvasColor,

      toolbarHeight: state.toolbarHeight,
      toolbarColor: state.toolbarColor,

      snackBarAlert,

      stageMinWidth: state.stageMinWidth,
      stageRatio: state.stageRatio,
      stageZoomMin: state.stageZoomMin,
      stageZoomMax: state.stageZoomMax,
      stageZoomStep: state.stageZoomStep,
      stageZoom: state.stageZoom,
      stageWidth: state.stageWidth,
      stageHeight: state.stageHeight,

      drawingMode,

      setDrawingMode,

      setStageRatio,
      setStageMinWidth,
      setStageZoom,
      zoomStage,
      dragStage,
      fitStage,
      setPointerStyle,
      expandStage,
      exportStage,
      getStageCenter,
      getStagePointerPosition,
      setStagePointerPosition,
      getIsStageDragable,
      setStageDragable,
      getStage,
      setStage,

      getGuideLines,
      setGuideLines,
      setGuideLinesThreshold,
      setGuideLinesStick,

      getBackground,
      setBackground,
      setBackgroundColor,
      setBackgroundOpacity,

      getGrid,
      setGrid,
      setGridStyle,

      updateSnackbarAlert,
    }),
    [i18n, state, drawingMode, snackBarAlert]
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
