import { HorizontalAlign, VerticalAlign } from "../types/Window";
import { SelectedIds, ShapesProviderProp } from "./Types";
import { IShapesContext } from "./Interfaces";
import { limitValue } from "../utils/Number";
import { Vector2d } from "konva/lib/types";
import { nanoid } from "nanoid";
import Konva from "konva";
import React from "react";
import {
  urlToBase64OrObjectURL,
  loadImageBlob,
  loadVideoBlob,
  loadImage,
  loadVideo,
} from "../utils/Image";
import {
  calculateGroupShapeBox,
  createShape,
  cloneLines,
} from "../utils/Shapes";
import {
  detectContentTypeFromFormat,
  saveFileFromBuffer,
} from "../utils/Utils";
import {
  KonvaShapeBox,
  KonvaShapeAPI,
  LayerAction,
  KonvaShape,
} from "../components/KonvaShape";

export const ShapesContext = React.createContext<IShapesContext>({});

type State = {
  singleIds: Record<string, boolean>;
  croppedIds: Record<string, boolean>;
  selectedIds: Record<string, boolean>;
  shapeList: KonvaShape[];
  copiedShapes: KonvaShape[];
  history: KonvaShape[][];
  historyIndex: number;
  maxHistory: number;
};

type Action = {
  type:
    | "SET_MAX_HISTORY"
    | "UPDATE_SELECTED_IDS"
    | "UPDATE_SHAPE"
    | "GROUP_SHAPES"
    | "ADD_SHAPES"
    | "DO_SHAPE"
    | "DELETE_SHAPES"
    | "COPY_SHAPE"
    | "DUPLICATE_SHAPE"
    | "MOVE_SHAPES"
    | "PASTE_SHAPE"
    | "LAYER_SHAPE"
    | "ALIGN_SHAPE"
    | "FLIP_SHAPE"
    | "CLEAN_HISTORY";
  payload?:
    | number
    | UpdateSelectedIds
    | Update
    | Group
    | Add
    | Do
    | Delete
    | Copy
    | Duplicate
    | Move
    | Paste
    | Layer
    | Align
    | Flip;
};

type Layer = {
  id: string;
  type: LayerAction;
};

type Update = {
  shapeRefs: Record<string, KonvaShapeAPI>;
  shape: KonvaShape;
  render: boolean;
  storeHistory: boolean;
};

type Move = {
  shapeRefs: Record<string, KonvaShapeAPI>;
  ids: string[];
  offsetX: number;
  offsetY: number;
};

type Group = {
  ids: string[];
  unGroup: boolean;
};

type Add = {
  overwrite: boolean;
  shapes: KonvaShape[];
  position: Vector2d;
};

type Do = {
  redo: boolean;
};

type Paste = {
  position: Vector2d;
};

type Delete = {
  shapeRefs: Record<string, KonvaShapeAPI>;
  ids: string[];
};

type UpdateSelectedIds = {
  shapeRefs: Record<string, KonvaShapeAPI>;
  selectedIds: SelectedIds;
  overwrite: boolean;
};

type Copy = {
  ids: string[];
  cut: boolean;
};

type Duplicate = {
  ids: string[];
  position: Vector2d;
};

type Flip = {
  shapeRefs: Record<string, KonvaShapeAPI>;
  id: string;
  vertical: boolean;
};

type Align = {
  shapeRefs: Record<string, KonvaShapeAPI>;
  id: string;
  horizontalAlign: HorizontalAlign;
  verticalAlign: VerticalAlign;
};

function reducer(state: State, action: Action): State {
  function addHistory(shapes: KonvaShape[]): {
    history: KonvaShape[][];
    historyIndex: number;
  } {
    // Calculate overflow
    const nextIndex: number = state.historyIndex + 1;
    const overflow: number = limitValue(
      state.historyIndex + 2 - state.maxHistory,
      0,
      undefined
    );

    // Create new history by clone
    const newHistory: KonvaShape[] = shapes.map((item) => {
      const { lines, ...newShape }: KonvaShape = item;

      if (newShape.type === "free-drawing") {
        newShape.lines = cloneLines(lines);
      }

      return newShape;
    });

    // Clone histories and add new history
    const newHistories: KonvaShape[][] = state.history.slice(
      overflow,
      nextIndex
    );
    newHistories.push(newHistory);

    return {
      history: newHistories,
      historyIndex: nextIndex - overflow,
    };
  }

  switch (action.type) {
    case "UPDATE_SELECTED_IDS": {
      const updateSelectedIds: UpdateSelectedIds =
        action.payload as UpdateSelectedIds;

      const newState: State = {
        ...state,
        croppedIds: {},
        selectedIds: {},
      };

      // ids !== undefined & overwrite === true -> select many with overwrite
      // ids !== undefined & overwrite !== true -> select many without overwrite
      // ids === undefined & overwrite === true -> {}
      // ids === undefined & overwrite !== true -> select all
      if (updateSelectedIds.selectedIds.selecteds) {
        if (!updateSelectedIds.overwrite) {
          newState.selectedIds = {
            ...state.selectedIds,
          };
        }

        updateSelectedIds.selectedIds.selecteds.forEach((item) => {
          newState.selectedIds[item] = true;
        });
      } else {
        if (!updateSelectedIds.overwrite) {
          state.shapeList.forEach((item) => {
            newState.selectedIds[item.id] = true;
          });
        }
      }

      if (updateSelectedIds.selectedIds.croppeds) {
        updateSelectedIds.selectedIds.croppeds.forEach((item) => {
          if (newState.selectedIds[item]) {
            newState.croppedIds[item] = true;
          }
        });
      }

      if (updateSelectedIds.selectedIds.singles) {
        updateSelectedIds.selectedIds.singles.forEach((item) => {
          if (newState.selectedIds[item]) {
            newState.singleIds[item] = true;
          }
        });
      }

      return newState;
    }

    case "UPDATE_SHAPE": {
      const update: Update = action.payload as Update;

      // Get shape id
      let shapeId: string = update.shape?.id;
      if (!shapeId) {
        const selectedIds: string[] = Object.keys(state.selectedIds);
        if (selectedIds.length === 1) {
          shapeId = selectedIds[0];
        } else {
          return state;
        }
      }

      // Get shape
      const matchedShapeIndex: number = state.shapeList.findIndex(
        (item) => item.id === shapeId
      );
      if (matchedShapeIndex === -1) {
        return state;
      }

      // Update shape
      Object.assign(state.shapeList[matchedShapeIndex], update.shape);

      // Render
      if (update.render) {
        update.shapeRefs[shapeId]?.updateShape(update.shape);
      }

      // Create new state
      return update.storeHistory
        ? {
            ...state,
            ...addHistory(state.shapeList),
          }
        : state;
    }

    case "GROUP_SHAPES": {
      const group: Group = action.payload as Group;

      // Get shape ids
      let shapeIds: string[] = group.ids;
      if (!shapeIds) {
        const selectedIds: string[] = Object.keys(state.selectedIds);
        if (selectedIds.length > 1) {
          shapeIds = selectedIds;
        } else {
          return state;
        }
      }

      // Add/Remove group ids
      state.shapeList.forEach((item) => {
        if (shapeIds.includes(item.id)) {
          if (group.unGroup) {
            delete item.groupIds;
          } else {
            item.groupIds = shapeIds;
          }
        }
      });

      return {
        ...state,
        ...addHistory(state.shapeList),
      };
    }

    case "ADD_SHAPES": {
      const add: Add = action.payload as Add;

      // Create new selected ids
      const selectedIds: Record<string, boolean> = {};

      // Create shape list
      let newShapeList: KonvaShape[] = add.shapes;

      // Asign position and Assign selected ids
      if (add.position) {
        const box: KonvaShapeBox = calculateGroupShapeBox(add.shapes);
        if (box) {
          const offsetX: number = add.position.x - box.centerX;
          const offsetY: number = add.position.y - box.centerY;

          newShapeList.forEach((item) => {
            item.x += offsetX;
            item.y += offsetY;

            selectedIds[item.id] = true;
          });
        } else {
          newShapeList.forEach((item) => {
            switch (item.type) {
              default: {
                break;
              }

              case "path":
              case "image":
              case "video":
              case "rectangle":
              case "text": {
                item.x =
                  add.position.x -
                  Math.abs(item.width * item.scaleX) / 2 +
                  item.offsetX;
                item.y =
                  add.position.y -
                  Math.abs(item.height * item.scaleY) / 2 +
                  item.offsetY;

                break;
              }

              case "ellipse":
              case "convex-polygon":
              case "concave-polygon":
              case "ring":
              case "wedge":
              case "circle": {
                item.x = add.position.x - item.offsetX;
                item.y = add.position.y - item.offsetY;

                break;
              }

              case "arrow":
              case "line": {
                item.x =
                  add.position.x -
                  (item.points[0] + item.points[2]) / 2 +
                  item.offsetX;
                item.y =
                  add.position.y -
                  (item.points[1] + item.points[3]) / 2 +
                  item.offsetY;

                break;
              }

              case "quadratic-curve":
              case "bezier-curve": {
                item.x =
                  add.position.x -
                  (item.points[0] + item.points[6]) / 2 +
                  item.offsetX;
                item.y =
                  add.position.y -
                  (item.points[1] + item.points[7]) / 2 +
                  item.offsetY;

                break;
              }
            }

            selectedIds[item.id] = true;
          });
        }
      } else {
        newShapeList.forEach((item) => {
          selectedIds[item.id] = true;
        });
      }

      // Clone shape list and Add new shapes
      if (!add.overwrite) {
        newShapeList = state.shapeList.concat(newShapeList);
      }

      // Create new state
      return {
        ...state,
        selectedIds: selectedIds,
        shapeList: newShapeList,
        ...addHistory(newShapeList),
      };
    }

    case "DO_SHAPE": {
      const d: Do = action.payload as Do;

      let newHistoryIndex: number;

      if (d.redo) {
        if (state.historyIndex === state.history.length - 1) {
          return state;
        }

        newHistoryIndex = state.historyIndex + 1;
      } else {
        if (state.historyIndex === 0) {
          return state;
        }

        newHistoryIndex = state.historyIndex - 1;
      }

      // Create new selected ids
      const selectedIds: Record<string, boolean> = {};

      // Clone shape list and Assign selected ids
      const newShapeList: KonvaShape[] = state.history[newHistoryIndex].map(
        (item) => {
          const { lines, ...newShape }: KonvaShape = item;

          if (newShape.type === "free-drawing") {
            newShape.lines = cloneLines(lines);
          }

          if (state.selectedIds[newShape.id]) {
            selectedIds[newShape.id] = true;
          }

          return newShape;
        }
      );

      return {
        ...state,
        selectedIds: selectedIds,
        shapeList: newShapeList,
        historyIndex: newHistoryIndex,
      };
    }

    case "DELETE_SHAPES": {
      const del: Delete = action.payload as Delete;

      // Get shape ids
      let shapeIds: string[] = del.ids;
      if (!shapeIds) {
        const selectedIds: string[] = Object.keys(state.selectedIds);
        if (selectedIds.length) {
          shapeIds = selectedIds;
        } else {
          return state;
        }
      }

      // Create new selected ids and new cropped ids
      const selectedIds: Record<string, boolean> = {};
      const croppedIds: Record<string, boolean> = {};
      const singleIds: Record<string, boolean> = {};

      // Clone shape list without deleted shapes and Assign selected ids
      const newShapeList: KonvaShape[] = state.shapeList.filter((item) => {
        const isKeep: boolean = !shapeIds.includes(item.id);

        if (isKeep) {
          if (state.selectedIds[item.id]) {
            selectedIds[item.id] = true;

            if (state.croppedIds[item.id]) {
              croppedIds[item.id] = true;
            }

            if (state.singleIds[item.id]) {
              singleIds[item.id] = true;
            }
          }
        }

        return isKeep;
      });

      return {
        ...state,
        croppedIds: croppedIds,
        selectedIds: selectedIds,
        singleIds: singleIds,
        shapeList: newShapeList,
        ...addHistory(newShapeList),
      };
    }

    case "COPY_SHAPE": {
      const copy: Copy = action.payload as Copy;

      // Get shape ids
      let shapeIds: string[] = copy.ids;
      if (!shapeIds) {
        const selectedIds: string[] = Object.keys(state.selectedIds);
        if (selectedIds.length) {
          shapeIds = selectedIds;
        } else {
          return state;
        }
      }

      // Get shapes
      const matchedShapes: KonvaShape[] = state.shapeList.filter((item) => {
        return shapeIds.includes(item.id);
      });
      if (!matchedShapes.length) {
        return state;
      }

      // Clone shapes
      const newCopiedShapes: KonvaShape[] = matchedShapes.map((item) => {
        const { lines, ...newCopiedShape }: KonvaShape = item;

        if (newCopiedShape.type === "free-drawing") {
          newCopiedShape.lines = cloneLines(lines);
        }

        return newCopiedShape;
      });

      if (copy.cut) {
        // Create new selected ids
        const selectedIds: Record<string, boolean> = {};

        // Clone shape list without deleted shape and Assign selected ids
        const newShapeList: KonvaShape[] = state.shapeList.filter((item) => {
          const isKeep: boolean = !shapeIds.includes(item.id);

          if (isKeep && state.selectedIds[item.id]) {
            selectedIds[item.id] = true;
          }

          return isKeep;
        });

        return {
          ...state,
          selectedIds: selectedIds,
          shapeList: newShapeList,
          copiedShapes: newCopiedShapes,
          ...addHistory(newShapeList),
        };
      } else {
        return {
          ...state,
          copiedShapes: newCopiedShapes,
        };
      }
    }

    case "PASTE_SHAPE": {
      // Check copied shape
      if (!state.copiedShapes) {
        return state;
      }

      const paste: Paste = action.payload as Paste;

      // Calculate offset
      let offsetX: number = 25;
      let offsetY: number = 25;

      if (paste.position) {
        const box: KonvaShapeBox = calculateGroupShapeBox(state.copiedShapes);
        if (box) {
          offsetX = paste.position.x - box.centerX;
          offsetY = paste.position.y - box.centerY;
        }
      }

      // Create new ids
      const newShapeIds: Record<string, string> = {};

      state.copiedShapes.forEach((shape) => {
        newShapeIds[shape.id] = nanoid();
      });

      const groups: Record<string, string[]> = {};

      state.copiedShapes.forEach((shape) => {
        if (shape.groupIds && !groups[newShapeIds[shape.groupIds[0]]]) {
          groups[newShapeIds[shape.groupIds[0]]] = shape.groupIds.map(
            (id) => newShapeIds[id]
          );
        }
      });

      // Create new selected ids
      const selectedIds: Record<string, boolean> = {};

      const newShapes: KonvaShape[] = state.copiedShapes.map((item) => {
        const { id, lines, groupIds, ...newCopiedShape }: KonvaShape = item;

        newCopiedShape.id = newShapeIds[item.id];

        if (newCopiedShape.type === "free-drawing") {
          newCopiedShape.lines = cloneLines(lines);
        }

        newCopiedShape.x += offsetX;
        newCopiedShape.y += offsetY;

        if (groupIds) {
          newCopiedShape.groupIds = groups[newShapeIds[groupIds[0]]];
        }

        const newShape: KonvaShape = createShape(newCopiedShape);

        selectedIds[newShape.id] = true;

        return newShape;
      });

      // Clone shape list and Add new shape
      const newShapeList: KonvaShape[] = state.shapeList.concat(newShapes);

      // Create new state
      return {
        ...state,
        croppedIds: {},
        selectedIds: selectedIds,
        shapeList: newShapeList,
        ...addHistory(newShapeList),
      };
    }

    case "DUPLICATE_SHAPE": {
      const duplicate: Duplicate = action.payload as Duplicate;

      // Get shape ids
      let shapeIds: string[] = duplicate.ids;
      if (!shapeIds) {
        const selectedIds: string[] = Object.keys(state.selectedIds);
        if (selectedIds.length) {
          shapeIds = selectedIds;
        } else {
          return state;
        }
      }

      // Get shapes
      const matchedShapes: KonvaShape[] = state.shapeList.filter((item) => {
        return shapeIds.includes(item.id);
      });
      if (!matchedShapes.length) {
        return state;
      }

      // Calculate offset
      let offsetX: number = 25;
      let offsetY: number = 25;

      if (duplicate.position) {
        const box: KonvaShapeBox = calculateGroupShapeBox(matchedShapes);
        if (box) {
          offsetX = duplicate.position.x - box.centerX;
          offsetY = duplicate.position.y - box.centerY;
        }
      }

      // Create new ids
      const newShapeIds: Record<string, string> = {};

      state.copiedShapes.forEach((shape) => {
        newShapeIds[shape.id] = nanoid();
      });

      const groups: Record<string, string[]> = {};

      state.copiedShapes.forEach((shape) => {
        if (shape.groupIds && !groups[newShapeIds[shape.groupIds[0]]]) {
          groups[newShapeIds[shape.groupIds[0]]] = shape.groupIds.map(
            (id) => newShapeIds[id]
          );
        }
      });

      // Create new selected ids
      const selectedIds: Record<string, boolean> = {};

      const newShapes: KonvaShape[] = state.copiedShapes.map((item) => {
        const { id, lines, groupIds, ...newCopiedShape }: KonvaShape = item;

        newCopiedShape.id = newShapeIds[item.id];

        if (newCopiedShape.type === "free-drawing") {
          newCopiedShape.lines = cloneLines(lines);
        }

        newCopiedShape.x += offsetX;
        newCopiedShape.y += offsetY;

        if (groupIds) {
          newCopiedShape.groupIds = groups[newShapeIds[groupIds[0]]];
        }

        const newShape: KonvaShape = createShape(newCopiedShape);

        selectedIds[newShape.id] = true;

        return newShape;
      });

      // Clone shape list and Add new shape
      const newShapeList: KonvaShape[] = state.shapeList.concat(newShapes);

      // Create new state
      return {
        ...state,
        croppedIds: {},
        selectedIds: selectedIds,
        shapeList: newShapeList,
        ...addHistory(newShapeList),
      };
    }

    case "MOVE_SHAPES": {
      const move: Move = action.payload as Move;

      // Get shape ids
      let shapeIds: string[] = move.ids;
      if (!shapeIds) {
        const selectedIds: string[] = Object.keys(state.selectedIds);
        if (selectedIds.length) {
          shapeIds = selectedIds;
        } else {
          return state;
        }
      }

      // Get shape
      shapeIds.forEach((shapeId) => {
        // Get shape
        const matchedShapeIndex: number = state.shapeList.findIndex(
          (item) => item.id === shapeId
        );
        if (matchedShapeIndex === -1) {
          return state;
        }

        // Update shape
        const newX: number =
          state.shapeList[matchedShapeIndex].x + move.offsetX;
        const newY: number =
          state.shapeList[matchedShapeIndex].y + move.offsetY;

        state.shapeList[matchedShapeIndex].x = newX;
        state.shapeList[matchedShapeIndex].y = newY;

        // Render
        move.shapeRefs[shapeId]?.updateShape({
          x: newX,
          y: newY,
        });
      });

      // Create new state
      return {
        ...state,
        ...addHistory(state.shapeList),
      };
    }

    case "LAYER_SHAPE": {
      const layer: Layer = action.payload as Layer;

      // Get shape id
      let shapeId: string = layer.id;
      if (!shapeId) {
        const selectedIds: string[] = Object.keys(state.selectedIds);
        if (selectedIds.length === 1) {
          shapeId = selectedIds[0];
        } else {
          return state;
        }
      }

      // Get shape index
      const matchedShapeIndex: number = state.shapeList.findIndex(
        (item) => item.id === shapeId
      );
      if (matchedShapeIndex === -1) {
        return state;
      }

      // Create new shape list
      let newShapeList: KonvaShape[];

      switch (layer.type) {
        default: {
          // Check is last element
          if (matchedShapeIndex === state.shapeList.length - 1) {
            return state;
          }

          // Clone shape list and Swap
          newShapeList = state.shapeList.slice(0);
          const temp: KonvaShape = newShapeList[matchedShapeIndex];
          newShapeList[matchedShapeIndex] = newShapeList[matchedShapeIndex + 1];
          newShapeList[matchedShapeIndex + 1] = temp;

          break;
        }

        case "backward": {
          // Check is first element
          if (matchedShapeIndex === 0) {
            return state;
          }

          // Clone shape list and Swap
          newShapeList = state.shapeList.slice(0);
          const temp: KonvaShape = newShapeList[matchedShapeIndex];
          newShapeList[matchedShapeIndex] = newShapeList[matchedShapeIndex - 1];
          newShapeList[matchedShapeIndex - 1] = temp;

          break;
        }

        case "back": {
          // Check is first element
          if (matchedShapeIndex === 0) {
            return state;
          }

          // Bring selected shape to begin of array
          newShapeList = [state.shapeList[matchedShapeIndex]];

          for (const item of state.shapeList) {
            if (item.id !== shapeId) {
              newShapeList.push(item);
            }
          }

          break;
        }

        case "front": {
          // Check is last element
          if (matchedShapeIndex === state.shapeList.length - 1) {
            return state;
          }

          // Bring selected shape to end of array
          newShapeList = state.shapeList.filter((item) => item.id !== shapeId);
          newShapeList.push(state.shapeList[matchedShapeIndex]);

          break;
        }
      }

      return {
        ...state,
        shapeList: newShapeList,
        ...addHistory(newShapeList),
      };
    }

    case "FLIP_SHAPE": {
      const flip: Flip = action.payload as Flip;

      // Get shape id
      let shapeId: string = flip.id;
      if (!shapeId) {
        const selectedIds: string[] = Object.keys(state.selectedIds);
        if (selectedIds.length === 1) {
          shapeId = selectedIds[0];
        } else {
          return state;
        }
      }

      // Get shape index
      const matchedShapeIndex: number = state.shapeList.findIndex(
        (item) => item.id === shapeId
      );
      if (matchedShapeIndex === -1) {
        return state;
      }

      // Update shape
      const currentShape: KonvaShape = state.shapeList[matchedShapeIndex];

      if (flip.vertical) {
        currentShape.scaleY = -currentShape.scaleY;
      } else {
        currentShape.scaleX = -currentShape.scaleX;
      }

      // Render
      flip.shapeRefs[shapeId]?.updateShape({
        scaleX: currentShape.scaleX,
        scaleY: currentShape.scaleY,
      });

      return {
        ...state,
        ...addHistory(state.shapeList),
      };
    }

    case "ALIGN_SHAPE": {
      const align: Align = action.payload as Align;

      // Get shape id
      let shapeId: string = align.id;
      if (!shapeId) {
        const selectedIds: string[] = Object.keys(state.selectedIds);
        if (selectedIds.length === 1) {
          shapeId = selectedIds[0];
        } else {
          return state;
        }
      }

      // Get shape index
      const matchedShapeIndex: number = state.shapeList.findIndex(
        (item) => item.id === shapeId
      );
      if (matchedShapeIndex === -1) {
        return state;
      }

      // Get shape
      const shapeAPI: KonvaShapeAPI = align.shapeRefs[shapeId];
      if (!shapeAPI) {
        return state;
      }

      const currentShape: KonvaShape = shapeAPI.getShape();
      const box: KonvaShapeBox = currentShape.box;
      const stage: Konva.Stage = shapeAPI.getStage();
      if (!box || !stage) {
        return state;
      }

      // Assign new position
      const newPosition: Vector2d = {
        x: currentShape.x + stage.width() / 2 - box.centerX,
        y: currentShape.y + stage.height() / 2 - box.centerY,
      };

      if (align.horizontalAlign === "left") {
        newPosition.x = currentShape.x - box.left;
      } else if (align.horizontalAlign === "right") {
        newPosition.x = currentShape.x + stage.width() - box.right;
      }

      if (align.verticalAlign === "top") {
        newPosition.y = currentShape.y - box.top;
      } else if (align.verticalAlign === "bottom") {
        newPosition.y = currentShape.y + stage.height() - box.bottom;
      }

      // Update shape
      Object.assign(currentShape, newPosition);

      // Render
      shapeAPI.updateShape(newPosition);

      return {
        ...state,
        ...addHistory(state.shapeList),
      };
    }

    case "CLEAN_HISTORY": {
      return {
        ...state,
        copiedShapes: undefined,
        history: [[]],
        historyIndex: 0,
      };
    }

    case "SET_MAX_HISTORY": {
      const newMaxHistory: number = action.payload as number;

      if (newMaxHistory > state.history.length) {
        return {
          ...state,
          maxHistory: newMaxHistory,
        };
      } else if (newMaxHistory === state.history.length) {
        return state;
      } else {
        const cutIndex: number = state.history.length - newMaxHistory;
        const historyIndex: number = state.historyIndex - cutIndex;

        return {
          ...state,
          maxHistory: newMaxHistory,
          history: state.history.slice(cutIndex),
          historyIndex: historyIndex < 0 ? 0 : historyIndex,
        };
      }
    }

    default: {
      return state;
    }
  }
}

export function ShapesProvider(prop: ShapesProviderProp): React.JSX.Element {
  // Store shape info
  const [state, dispatch] = React.useReducer(reducer, {
    croppedIds: {},
    selectedIds: {},
    singleIds: {},
    shapeList: [],
    copiedShapes: undefined,
    history: [[]],
    historyIndex: 0,
    maxHistory: prop.maxHistory,
  });

  // Store shape refs
  const shapeRefsRef = React.useRef<Record<string, KonvaShapeAPI>>({});

  /**
   * Selected shape
   */
  const selectedShape: KonvaShape = React.useMemo<KonvaShape>(() => {
    let shapeId: string;
    const selectedIds: string[] = Object.keys(state.selectedIds);
    if (selectedIds.length === 1) {
      shapeId = selectedIds[0];
    }

    return state.shapeList.find((item) => item.id === shapeId) ?? {};
  }, [state.shapeList, state.selectedIds]);

  /**
   * Can undo
   */
  const canUndo: boolean = React.useMemo<boolean>(() => {
    return state.historyIndex > 0;
  }, [state.historyIndex]);

  /**
   * Can redo
   */
  const canRedo: boolean = React.useMemo<boolean>(() => {
    return state.historyIndex < state.history.length - 1;
  }, [state.historyIndex, state.history]);

  /**
   * Update selected ids
   */
  const updateSelectedIds = React.useCallback(
    (selectedIds: SelectedIds, overwrite?: boolean): void => {
      dispatch({
        type: "UPDATE_SELECTED_IDS",
        payload: {
          shapeRefs: shapeRefsRef.current,
          selectedIds: selectedIds,
          overwrite: overwrite,
        },
      });
    },
    []
  );

  /**
   * Add shapes
   */
  const addShapes = React.useCallback(
    async (
      shapes: KonvaShape[],
      overwrite?: boolean,
      processBase64ImageURL?: boolean,
      position?: Vector2d
    ): Promise<void> => {
      const newShapes: KonvaShape[] = await Promise.all(
        shapes.map(async (item) => {
          if (processBase64ImageURL !== undefined) {
            if (item.imageURL) {
              if (item.type === "image") {
                item.image = await loadImage(
                  item.imageURL,
                  processBase64ImageURL
                );
              } else if (item.type === "video") {
                item.image = await loadVideo(
                  item.imageURL,
                  processBase64ImageURL
                );
              }

              delete item.imageURL;
            }
          }

          if (item.imageBlob) {
            if (item.type === "image") {
              item.image = await loadImageBlob(item.imageBlob);
            } else if (item.type === "video") {
              item.image = await loadVideoBlob(item.imageBlob);
            }

            delete item.imageBlob;
          }

          return createShape(item);
        })
      );

      dispatch({
        type: "ADD_SHAPES",
        payload: {
          shapes: newShapes,
          overwrite: overwrite,
          position: position,
        },
      });
    },
    []
  );

  /**
   * Delete shapes
   */
  const deleteShapes = React.useCallback((ids?: string[]): void => {
    dispatch({
      type: "DELETE_SHAPES",
      payload: {
        shapeRefs: shapeRefsRef.current,
        ids: ids,
      },
    });
  }, []);

  /**
   * Copy shape
   */
  const copyShape = React.useCallback((ids?: string[], cut?: boolean): void => {
    dispatch({
      type: "COPY_SHAPE",
      payload: {
        ids: ids,
        cut: cut,
      },
    });
  }, []);

  /**
   * Paste shape
   */
  const pasteShape = React.useCallback((position?: Vector2d): void => {
    dispatch({
      type: "PASTE_SHAPE",
      payload: {
        position: position,
      },
    });
  }, []);

  /**
   * Duplicate shape
   */
  const duplicateShape = React.useCallback(
    (ids?: string[], position?: Vector2d): void => {
      dispatch({
        type: "DUPLICATE_SHAPE",
        payload: {
          ids: ids,
          position: position,
        },
      });
    },
    []
  );

  /**
   * Update shape
   */
  const updateShape = React.useCallback(
    (shape: KonvaShape, render?: boolean, storeHistory?: boolean): void => {
      dispatch({
        type: "UPDATE_SHAPE",
        payload: {
          shapeRefs: shapeRefsRef.current,
          shape: shape,
          storeHistory: storeHistory,
          render: render,
        },
      });
    },
    []
  );

  /**
   * Group shapes
   */
  const groupShapes = React.useCallback(
    (ids?: string[], unGroup?: boolean): void => {
      dispatch({
        type: "GROUP_SHAPES",
        payload: {
          ids: ids,
          unGroup: unGroup,
        },
      });
    },
    []
  );

  /**
   * Move shapes
   */
  const moveShapes = React.useCallback(
    (ids: string[], offsetX: number, offsetY: number): void => {
      dispatch({
        type: "MOVE_SHAPES",
        payload: {
          shapeRefs: shapeRefsRef.current,
          ids: ids,
          offsetX: offsetX,
          offsetY: offsetY,
        },
      });
    },
    []
  );

  /**
   * Layer shape
   */
  const layerShape = React.useCallback(
    (id?: string, type?: LayerAction): void => {
      dispatch({
        type: "LAYER_SHAPE",
        payload: {
          id: id,
          type: type,
        },
      });
    },
    []
  );

  /**
   * Flip shape
   */
  const flipShape = React.useCallback(
    (id?: string, vertical?: boolean): void => {
      dispatch({
        type: "FLIP_SHAPE",
        payload: {
          shapeRefs: shapeRefsRef.current,
          id: id,
          vertical: vertical,
        },
      });
    },
    []
  );

  /**
   * Align shape
   */
  const alignShape = React.useCallback(
    (
      id?: string,
      horizontalAlign?: HorizontalAlign,
      verticalAlign?: VerticalAlign
    ): void => {
      dispatch({
        type: "ALIGN_SHAPE",
        payload: {
          shapeRefs: shapeRefsRef.current,
          id: id,
          horizontalAlign: horizontalAlign,
          verticalAlign: verticalAlign,
        },
      });
    },
    []
  );

  /**
   * Export shapes (To JSON file)
   */
  const exportShapes = React.useCallback(
    async (save?: boolean, fileName?: string): Promise<string> => {
      const shapeList: KonvaShape[] = await Promise.all(
        state.shapeList.map(async (item) => {
          const { id, ...newItem }: KonvaShape = item;

          if (newItem.image) {
            if (newItem.type === "image") {
              newItem.imageURL = await urlToBase64OrObjectURL(
                (newItem.image as HTMLImageElement).src,
                false
              );
            } else if (newItem.type === "video") {
              newItem.imageURL = await urlToBase64OrObjectURL(
                (newItem.image as HTMLVideoElement).src,
                false
              );
            }

            delete newItem.image;
          }

          return newItem;
        })
      );

      const shapeListString: string = JSON.stringify(shapeList);

      if (save) {
        saveFileFromBuffer(
          shapeListString,
          fileName || `image.json`,
          detectContentTypeFromFormat("json")
        );
      }

      return shapeListString;
    },
    [state.shapeList]
  );

  /**
   * Clean history
   */
  const cleanHistory = React.useCallback((): void => {
    dispatch({
      type: "CLEAN_HISTORY",
    });
  }, []);

  /**
   * Set max history
   */
  const setMaxHistory = React.useCallback((max: number): void => {
    dispatch({
      type: "SET_MAX_HISTORY",
      payload: max,
    });
  }, []);

  /**
   * Do shapes
   */
  const doShapes = React.useCallback((redo?: boolean): void => {
    dispatch({
      type: "DO_SHAPE",
      payload: {
        redo: redo,
      },
    });
  }, []);

  const contextValue: IShapesContext = React.useMemo<IShapesContext>(
    () => ({
      maxHistory: state.maxHistory,
      canUndo,
      canRedo,

      croppedIds: state.croppedIds,
      selectedIds: state.selectedIds,
      singleIds: state.singleIds,
      shapeList: state.shapeList,
      copiedShapes: state.copiedShapes,
      shapeRefs: shapeRefsRef.current,
      selectedShape,

      exportShapes,
      updateSelectedIds,
      addShapes,
      groupShapes,
      moveShapes,
      deleteShapes,
      copyShape,
      pasteShape,
      duplicateShape,
      updateShape,
      layerShape,
      alignShape,
      flipShape,
      cleanHistory,
      setMaxHistory,
      doShapes,
    }),
    [state]
  );

  return (
    <ShapesContext.Provider value={contextValue}>
      {prop.children}
    </ShapesContext.Provider>
  );
}

export function useShapesContext(): IShapesContext {
  return React.useContext(ShapesContext);
}
