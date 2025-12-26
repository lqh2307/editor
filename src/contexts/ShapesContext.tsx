import { KonvaTransformerAPI } from "../components/KonvaTransformer";
import { HorizontalAlign, VerticalAlign } from "../types/Window";
import { IShapesContext } from "./Interfaces";
import { ShapesProviderProp } from "./Types";
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
  removeNestedArrayItems,
  saveFileFromBuffer,
  compareArray,
} from "../utils/Utils";
import {
  KonvaShapeBox,
  KonvaShapeAPI,
  LayerAction,
  KonvaShape,
} from "../components/KonvaShape";

export const ShapesContext = React.createContext<IShapesContext>({});

type State = {
  edittedId: string;
  selectedIds: Record<string, boolean>;
  singleSelectedIds: Record<string, boolean>;

  shapeList: KonvaShape[];

  copiedShapes: KonvaShape[];

  history: KonvaShape[][];
  historyIndex: number;
  maxHistory: number;
};

type Action = {
  type:
    | "UPDATE_EDITTED_ID"
    | "UPDATE_SELECTED_IDS"
    | "UPDATE_SINGLE_SELECTED_IDS"
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
    | "SET_MAX_HISTORY"
    | "CLEAN_HISTORY";
  payload?:
    | UpdateEdittedId
    | UpdateSelectedIds
    | UpdateSingleSelectedIds
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
    | Flip
    | number;
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
  ids: string[];
};

type UpdateEdittedId = {
  id: string;
};

type UpdateSelectedIds = {
  ids: string[];
  overwrite: boolean;
};

type UpdateSingleSelectedIds = {
  ids: string[];
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
      const { lines, points, ...newShape }: KonvaShape = item;

      if (lines) {
        newShape.lines = cloneLines(lines);
      } else if (points) {
        newShape.points = points.slice(0);
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
    case "UPDATE_EDITTED_ID": {
      const updateEdittedId: UpdateEdittedId =
        action.payload as UpdateEdittedId;

      return {
        ...state,
        edittedId: updateEdittedId.id,
      };
    }

    case "UPDATE_SELECTED_IDS": {
      const updateSelectedIds: UpdateSelectedIds =
        action.payload as UpdateSelectedIds;

      // Create new selected ids
      let selectedIds: Record<string, boolean> = {};

      // ids !== undefined & overwrite === undefined -> delete many
      // ids !== undefined & overwrite === false -> select many without overwrite
      // ids !== undefined & overwrite === true -> select many with overwrite
      // ids === undefined & overwrite === undefined -> delete all
      // ids === undefined & overwrite === false -> select all
      // ids === undefined & overwrite === true -> {}
      if (updateSelectedIds.ids) {
        if (updateSelectedIds.overwrite === false) {
          selectedIds = {
            ...state.selectedIds,
          };

          updateSelectedIds.ids.forEach((id) => {
            selectedIds[id] = true;
          });
        } else if (updateSelectedIds.overwrite === true) {
          updateSelectedIds.ids.forEach((id) => {
            selectedIds[id] = true;
          });
        } else {
          selectedIds = {
            ...state.selectedIds,
          };

          updateSelectedIds.ids.forEach((id) => {
            delete selectedIds[id];
          });
        }
      } else {
        if (updateSelectedIds.overwrite === false) {
          state.shapeList.forEach((item) => {
            selectedIds[item.id] = true;
          });
        }
      }

      return {
        ...state,
        edittedId: undefined,
        selectedIds: selectedIds,
        singleSelectedIds: {},
      };
    }

    case "UPDATE_SINGLE_SELECTED_IDS": {
      const updateSingleSelectedIds: UpdateSingleSelectedIds =
        action.payload as UpdateSingleSelectedIds;

      // Create new single selected ids
      let singleSelectedIds: Record<string, boolean> = {};

      // ids !== undefined & overwrite === undefined -> delete many
      // ids !== undefined & overwrite === false -> select many without overwrite
      // ids !== undefined & overwrite === true -> select many with overwrite
      // ids === undefined & overwrite === undefined -> delete all
      // ids === undefined & overwrite === false -> select all
      // ids === undefined & overwrite === true -> {}
      if (updateSingleSelectedIds.ids) {
        if (updateSingleSelectedIds.overwrite === false) {
          singleSelectedIds = {
            ...state.singleSelectedIds,
          };

          updateSingleSelectedIds.ids.forEach((id) => {
            singleSelectedIds[id] = true;
          });
        } else if (updateSingleSelectedIds.overwrite === true) {
          updateSingleSelectedIds.ids.forEach((id) => {
            singleSelectedIds[id] = true;
          });
        } else {
          singleSelectedIds = {
            ...state.singleSelectedIds,
          };

          updateSingleSelectedIds.ids.forEach((id) => {
            delete singleSelectedIds[id];
          });
        }
      } else {
        if (updateSingleSelectedIds.overwrite === false) {
          state.shapeList.forEach((item) => {
            singleSelectedIds[item.id] = true;
          });
        }
      }

      return {
        ...state,
        edittedId: undefined,
        singleSelectedIds: singleSelectedIds,
      };
    }

    case "UPDATE_SHAPE": {
      const update: Update = action.payload as Update;

      // Get shape id
      let shapeId: string = update.shape?.id;
      if (!shapeId) {
        let selectedIds: string[] = Object.keys(state.singleSelectedIds);
        if (selectedIds.length) {
          shapeId = selectedIds[0];
        } else {
          selectedIds = Object.keys(state.selectedIds);
          if (selectedIds.length) {
            shapeId = selectedIds[0];
          } else {
            return state;
          }
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
      if (!group.ids) {
        group.ids = Object.keys(state.selectedIds);
        if (!group.ids.length) {
          return state;
        }
      }

      // Create new selected ids
      let selectedIds: Record<string, boolean>;

      // Process group ids
      let previousGroupIds: any[];

      if (group.unGroup) {
        for (const id of group.ids) {
          const shape: KonvaShape = state.shapeList.find(
            (item) => item.id === id
          );
          if (shape?.groupIds) {
            if (shape.originGroupIds === shape.groupIds) {
              continue;
            }

            if (previousGroupIds !== shape.groupIds) {
              shape.groupIds.forEach((groupId) => {
                if (Array.isArray(groupId)) {
                  groupId.flat(Infinity).forEach((subId) => {
                    const subShape: KonvaShape = state.shapeList.find(
                      (item) => item.id === (subId as string)
                    );
                    if (subShape) {
                      subShape.groupIds = groupId;
                    }
                  });
                } else {
                  const subShape: KonvaShape = state.shapeList.find(
                    (item) => item.id === (groupId as string)
                  );
                  if (subShape) {
                    delete subShape.groupIds;
                  }
                }
              });
            }

            previousGroupIds = shape.groupIds;
          }
        }

        selectedIds = {};
      } else {
        const groupIds: any[] = [];

        for (const id of group.ids) {
          const shape: KonvaShape = state.shapeList.find(
            (item) => item.id === id
          );
          if (shape) {
            if (shape.groupIds) {
              if (
                shape.originGroupIds &&
                compareArray(
                  group.ids,
                  shape.originGroupIds.flat(Infinity),
                  true
                )
              ) {
                continue;
              }

              if (previousGroupIds !== shape.groupIds) {
                groupIds.push(shape.groupIds);

                previousGroupIds = shape.groupIds;
              }
            } else {
              groupIds.push(id);
            }

            shape.groupIds = groupIds;
          }
        }

        selectedIds = { ...state.selectedIds };
      }

      return {
        ...state,
        edittedId: undefined,
        selectedIds: selectedIds,
        singleSelectedIds: {},
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
              case "quadratic-arrow-curve":
              case "bezier-curve":
              case "bezier-arrow-curve": {
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
        edittedId: undefined,
        selectedIds: selectedIds,
        singleSelectedIds: {},
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

      // Clone shape list and Assign selected ids
      const newShapeList: KonvaShape[] = state.history[newHistoryIndex].map(
        (item) => {
          const { lines, points, ...newShape }: KonvaShape = item;

          if (lines) {
            newShape.lines = cloneLines(lines);
          } else if (points) {
            newShape.points = points.slice(0);
          }

          return newShape;
        }
      );

      return {
        ...state,
        edittedId: undefined,
        selectedIds: {},
        singleSelectedIds: {},
        shapeList: newShapeList,
        historyIndex: newHistoryIndex,
      };
    }

    case "DELETE_SHAPES": {
      const del: Delete = action.payload as Delete;

      let newShapeList: KonvaShape[];

      // Create new selected ids
      const selectedIds: Record<string, boolean> = {};

      if (del.ids) {
        const idsSet: Set<string> = new Set(del.ids);

        // Clone shape list without deleted shapes and Assign selected ids
        newShapeList = state.shapeList.filter((item) => {
          const isKeep: boolean = !idsSet.has(item.id);

          if (isKeep) {
            if (state.selectedIds[item.id]) {
              selectedIds[item.id] = true;
            }
          }

          return isKeep;
        });
      } else {
        // Get shape ids
        const singleIds: string[] = Object.keys(state.singleSelectedIds);
        if (singleIds.length) {
          const singleIdsSet: Set<string> = new Set(singleIds);

          let groupIds: any[];

          const shape: KonvaShape = state.shapeList.find(
            (item) => item.id === singleIds[0]
          );
          if (shape.groupIds) {
            groupIds = shape.groupIds;

            groupIds = removeNestedArrayItems(groupIds, singleIds);
          }

          // Clone shape list without deleted shapes and Assign selected ids
          newShapeList = state.shapeList.filter((item) => {
            const isKeep: boolean = !singleIdsSet.has(item.id);

            if (isKeep) {
              if (state.selectedIds[item.id]) {
                selectedIds[item.id] = true;

                if (groupIds) {
                  item.groupIds = groupIds;
                } else {
                  delete item.groupIds;
                }
              }
            }

            return isKeep;
          });
        } else {
          const ids: string[] = Object.keys(state.selectedIds);
          if (ids.length) {
            const idsSet: Set<string> = new Set(ids);

            // Clone shape list without deleted shapes and Assign selected ids
            newShapeList = state.shapeList.filter((item) => {
              const isKeep: boolean = !idsSet.has(item.id);

              if (isKeep) {
                if (state.selectedIds[item.id]) {
                  selectedIds[item.id] = true;
                }
              }

              return isKeep;
            });
          } else {
            return state;
          }
        }
      }

      return {
        ...state,
        edittedId: undefined,
        selectedIds: selectedIds,
        singleSelectedIds: {},
        shapeList: newShapeList,
        ...addHistory(newShapeList),
      };
    }

    case "COPY_SHAPE": {
      const copy: Copy = action.payload as Copy;

      // Get shape ids
      if (!copy.ids) {
        copy.ids = Object.keys(state.selectedIds);
        if (!copy.ids.length) {
          return state;
        }
      }

      const shapeIdsSet: Set<string> = new Set(copy.ids);

      // Get shapes
      const matchedShapes: KonvaShape[] = state.shapeList.filter((item) => {
        return shapeIdsSet.has(item.id);
      });
      if (!matchedShapes.length) {
        return state;
      }

      // Clone shapes
      const newCopiedShapes: KonvaShape[] = matchedShapes.map((item) => {
        const { lines, points, ...newCopiedShape }: KonvaShape = item;

        if (lines) {
          newCopiedShape.lines = cloneLines(lines);
        } else if (points) {
          newCopiedShape.points = points.slice(0);
        }

        return newCopiedShape;
      });

      if (copy.cut) {
        // Create new selected ids
        const selectedIds: Record<string, boolean> = {};

        // Clone shape list without deleted shape and Assign selected ids
        const newShapeList: KonvaShape[] = state.shapeList.filter((item) => {
          const isKeep: boolean = !shapeIdsSet.has(item.id);

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
      const newShapeIds: Record<string, string> = {}; // oldId -> newId
      const groups: Record<string, any[]> = {}; // newId -> newGroupIds[]
      const groupCache: Map<any[], any[]> = new Map(); // oldGroupIds -> newGroupIds

      state.copiedShapes.forEach((item) => {
        newShapeIds[item.id] = nanoid();

        groups[newShapeIds[item.id]] = item.groupIds;
      });

      function cloneGroupIds(groupIds: any[]): any[] {
        if (Array.isArray(groupIds)) {
          const newGroupIds: any[] = [];

          groupIds.forEach((oldNode) => {
            newGroupIds.push(cloneGroupIds(oldNode));
          });

          return newGroupIds;
        } else {
          return newShapeIds[groupIds] as any;
        }
      }

      // Create new selected ids
      const selectedIds: Record<string, boolean> = {};

      const newShapes: KonvaShape[] = state.copiedShapes.map((item) => {
        const {
          id,
          lines,
          points,
          originGroupIds,
          groupIds,
          ...newCopiedShape
        }: KonvaShape = item;

        newCopiedShape.id = newShapeIds[item.id];

        if (lines) {
          newCopiedShape.lines = cloneLines(lines);
        } else if (points) {
          newCopiedShape.points = points.slice(0);
        }

        newCopiedShape.x += offsetX;
        newCopiedShape.y += offsetY;

        if (groupIds) {
          let cached: any[] = groupCache.get(groupIds);
          if (!cached) {
            cached = cloneGroupIds(groupIds);

            groupCache.set(groupIds, cached);
          }

          newCopiedShape.groupIds = cached;

          if (originGroupIds) {
            newCopiedShape.originGroupIds = newCopiedShape.groupIds;
          }
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
        edittedId: undefined,
        selectedIds: selectedIds,
        singleSelectedIds: {},
        shapeList: newShapeList,
        ...addHistory(newShapeList),
      };
    }

    case "DUPLICATE_SHAPE": {
      const duplicate: Duplicate = action.payload as Duplicate;

      let shapeIdsSet: Set<string>;

      // Get shape ids
      if (!duplicate.ids) {
        duplicate.ids = Object.keys(state.selectedIds);
        if (!duplicate.ids.length) {
          return state;
        }
      }

      // Get shapes
      const matchedShapes: KonvaShape[] = state.shapeList.filter((item) => {
        return shapeIdsSet.has(item.id);
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
      const newShapeIds: Record<string, string> = {}; // oldId -> newId
      const groups: Record<string, any[]> = {}; // newId -> newGroupIds[]
      const groupCache: Map<any[], any[]> = new Map(); // oldGroupIds -> newGroupIds

      state.copiedShapes.forEach((item) => {
        newShapeIds[item.id] = nanoid();

        groups[newShapeIds[item.id]] = item.groupIds;
      });

      function cloneGroupIds(groupIds: any[]): any[] {
        if (Array.isArray(groupIds)) {
          const newGroupIds: any[] = [];

          groupIds.forEach((oldNode) => {
            newGroupIds.push(cloneGroupIds(oldNode));
          });

          return newGroupIds;
        } else {
          return newShapeIds[groupIds] as any;
        }
      }

      // Create new selected ids
      const selectedIds: Record<string, boolean> = {};

      const newShapes: KonvaShape[] = state.copiedShapes.map((item) => {
        const {
          id,
          lines,
          points,
          originGroupIds,
          groupIds,
          ...newCopiedShape
        }: KonvaShape = item;

        newCopiedShape.id = newShapeIds[item.id];

        if (lines) {
          newCopiedShape.lines = cloneLines(lines);
        } else if (points) {
          newCopiedShape.points = points.slice(0);
        }

        newCopiedShape.x += offsetX;
        newCopiedShape.y += offsetY;

        if (groupIds) {
          let cached: any[] = groupCache.get(groupIds);
          if (!cached) {
            cached = cloneGroupIds(groupIds);

            groupCache.set(groupIds, cached);
          }

          newCopiedShape.groupIds = cached;

          if (originGroupIds) {
            newCopiedShape.originGroupIds = newCopiedShape.groupIds;
          }
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
        edittedId: undefined,
        selectedIds: selectedIds,
        singleSelectedIds: {},
        shapeList: newShapeList,
        ...addHistory(newShapeList),
      };
    }

    case "MOVE_SHAPES": {
      const move: Move = action.payload as Move;

      // Get shape ids
      if (!move.ids) {
        move.ids = Object.keys(state.singleSelectedIds);
        if (!move.ids.length) {
          move.ids = Object.keys(state.selectedIds);
          if (!move.ids.length) {
            return state;
          }
        }
      }

      // Get shape
      move.ids.forEach((shapeId) => {
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
      if (!layer.id) {
        let selectedIds: string[] = Object.keys(state.singleSelectedIds);
        if (selectedIds.length) {
          layer.id = selectedIds[0];
        } else {
          selectedIds = Object.keys(state.selectedIds);
          if (selectedIds.length) {
            layer.id = selectedIds[0];
          } else {
            return state;
          }
        }
      }

      // Get shape index
      const matchedShapeIndex: number = state.shapeList.findIndex(
        (item) => item.id === layer.id
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
            if (item.id !== layer.id) {
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
          newShapeList = state.shapeList.filter((item) => item.id !== layer.id);
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
      if (!flip.id) {
        let selectedIds: string[] = Object.keys(state.singleSelectedIds);
        if (selectedIds.length) {
          flip.id = selectedIds[0];
        } else {
          selectedIds = Object.keys(state.selectedIds);
          if (selectedIds.length) {
            flip.id = selectedIds[0];
          } else {
            return state;
          }
        }
      }

      // Get shape index
      const matchedShapeIndex: number = state.shapeList.findIndex(
        (item) => item.id === flip.id
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
      flip.shapeRefs[flip.id]?.updateShape({
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
      if (!align.id) {
        let selectedIds: string[] = Object.keys(state.singleSelectedIds);
        if (selectedIds.length) {
          align.id = selectedIds[0];
        } else {
          selectedIds = Object.keys(state.selectedIds);
          if (selectedIds.length) {
            align.id = selectedIds[0];
          } else {
            return state;
          }
        }
      }

      // Get shape index
      const matchedShapeIndex: number = state.shapeList.findIndex(
        (item) => item.id === align.id
      );
      if (matchedShapeIndex === -1) {
        return state;
      }

      // Get shape
      const shapeAPI: KonvaShapeAPI = align.shapeRefs[align.id];
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
    edittedId: undefined,
    selectedIds: {},
    singleSelectedIds: {},

    shapeList: [],

    copiedShapes: undefined,

    history: [[]],
    historyIndex: 0,
    maxHistory: prop.maxHistory,
  });

  // Store shape refs
  const shapeRefsRef = React.useRef<Record<string, KonvaShapeAPI>>({});

  // Store transformer refs
  const transformerRefsRef = React.useRef<Record<string, KonvaTransformerAPI>>(
    {}
  );

  /**
   * Selected group ids
   */
  const selectedGroupIds: string[] = React.useMemo<string[]>(() => {
    let groupIds: string[];

    for (const id in state.selectedIds) {
      const shape: KonvaShape = state.shapeList.find((item) => item.id === id);
      if (shape?.groupIds) {
        if (!groupIds) {
          groupIds = shape.groupIds;
        }

        if (groupIds !== shape.groupIds) {
          return;
        }
      } else {
        return;
      }
    }

    return groupIds;
  }, [state.shapeList, state.selectedIds]);

  /**
   * Selected shape
   */
  const selectedShape: KonvaShape = React.useMemo<KonvaShape>(() => {
    let shape: KonvaShape;

    const selectedIds: string[] = Object.keys(state.selectedIds);
    const singleSelectedIds: string[] = Object.keys(state.singleSelectedIds);
    if (singleSelectedIds.length === 1) {
      shape = state.shapeList.find((item) => item.id === singleSelectedIds[0]);
    } else if (selectedIds.length === 1) {
      shape = state.shapeList.find((item) => item.id === selectedIds[0]);
    }

    return shape ?? {};
  }, [state.shapeList, state.selectedIds, state.singleSelectedIds]);

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
   * Update editted id
   */
  const updateEdittedId = React.useCallback((id?: string): void => {
    dispatch({
      type: "UPDATE_EDITTED_ID",
      payload: {
        id: id,
      },
    });
  }, []);

  /**
   * Update selected ids
   */
  const updateSelectedIds = React.useCallback(
    (ids?: string[], overwrite?: boolean): void => {
      dispatch({
        type: "UPDATE_SELECTED_IDS",
        payload: {
          ids: ids,
          overwrite: overwrite,
        },
      });
    },
    []
  );

  /**
   * Update single selected ids
   */
  const updateSingleSelectedIds = React.useCallback(
    (ids?: string[], overwrite?: boolean): void => {
      dispatch({
        type: "UPDATE_SINGLE_SELECTED_IDS",
        payload: {
          ids: ids,
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
          const newItem: KonvaShape = { ...item };

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

      edittedId: state.edittedId,
      updateEdittedId,

      selectedIds: state.selectedIds,
      updateSelectedIds,

      singleSelectedIds: state.singleSelectedIds,
      updateSingleSelectedIds,

      selectedGroupIds,
      selectedShape,
      shapeList: state.shapeList,
      copiedShapes: state.copiedShapes,
      shapeRefs: shapeRefsRef.current,
      transformerRefs: transformerRefsRef.current,

      exportShapes,
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
