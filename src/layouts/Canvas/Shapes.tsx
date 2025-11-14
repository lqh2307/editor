import { KonvaTransformerAPI } from "../../components/KonvaTransformer";
import { KonvaGuideLinesAPI } from "../../components/KonvaGuideLines";
import { calculateGroupShapeBox } from "../../utils/Shapes";
import Konva from "konva";
import React from "react";
import {
  KonvaConcavePolygon,
  KonvaConvexPolygon,
  KonvaFreeDrawing,
  KonvaRectangle,
  KonvaShapeBox,
  KonvaShapeAPI,
  RenderReason,
  KonvaEllipse,
  KonvaCircle,
  KonvaArrow,
  KonvaImage,
  KonvaWedge,
  KonvaVideo,
  KonvaShape,
  KonvaLine,
  KonvaText,
  KonvaRing,
  KonvaPath,
} from "../../components/KonvaShape";
import {
  useFreeDrawingContext,
  useShapesContext,
  useStageContext,
  useAppContext,
} from "../../contexts";

export const CanvasShapes = React.memo((): React.JSX.Element => {
  const { guideLinesThreshold, guideLinesStick } = useAppContext();

  const {
    stageWidth,
    stageHeight,
    getGuideLines,
    getTransformer,
    expandStage,
    setPointerStyle,
  } = useStageContext();

  const {
    shapeList,
    selectedIds,
    shapeRefs,
    updateSelectedIds,
    updateShape,
    moveShapes,
  } = useShapesContext();

  const { freeDrawingMode } = useFreeDrawingContext();

  const handleShapeClick = React.useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>, shapeAPI: KonvaShapeAPI): void => {
      if (freeDrawingMode) {
        return;
      }

      const currentShape: KonvaShape = shapeAPI.getShape();
      if (currentShape) {
        // Set selected id
        updateSelectedIds([currentShape.id], e.evt?.ctrlKey ? false : true);
      }
    },
    [freeDrawingMode, updateSelectedIds]
  );

  const handleShapeMouseOver = React.useCallback(
    (shapeAPI: KonvaShapeAPI): void => {
      if (freeDrawingMode) {
        return;
      }

      const currentShape: KonvaShape = shapeAPI.getShape();
      if (currentShape) {
        // Set cursor style
        setPointerStyle(selectedIds?.[currentShape.id] ? "move" : "pointer");
      }
    },
    [freeDrawingMode, selectedIds, setPointerStyle]
  );

  const handleShapeMouseLeave = React.useCallback((): void => {
    if (freeDrawingMode) {
      return;
    }

    // Reset cursor style
    setPointerStyle();
  }, [freeDrawingMode, setPointerStyle]);

  const handleShapeDragMove = React.useCallback(
    (shapeAPI: KonvaShapeAPI): void => {
      const guideLines: KonvaGuideLinesAPI = getGuideLines();
      if (!guideLines) {
        return;
      }

      // Calculate box
      let box: KonvaShapeBox;

      const _selectedIds: string[] = selectedIds
        ? Object.keys(selectedIds)
        : undefined;
      if (shapeRefs && _selectedIds?.length) {
        const shapes: KonvaShape[] = [];

        _selectedIds.forEach((item) => {
          const shape: KonvaShape = shapeRefs[item]?.getShape();
          if (shape) {
            shapes.push(shape);
          }
        });

        box = calculateGroupShapeBox(shapes);
      } else {
        box = shapeAPI.getShape()?.box;
      }

      if (!box) {
        return;
      }

      // Set guide lines
      const newHorizontals: number[][] = [];
      const newVerticals: number[][] = [];

      const stageBox: KonvaShapeBox = {
        left: 0,
        centerX: stageWidth / 2,
        right: stageWidth,
        top: 0,
        centerY: stageHeight / 2,
        bottom: stageHeight,
      };

      for (const shape of shapeList) {
        const shapeBox: KonvaShapeBox = shape.box;
        if (selectedIds?.[shape.id] || !shapeBox) {
          continue;
        }

        ["left", "centerX", "right"].forEach((key) => {
          if (Math.abs(box[key] - shapeBox[key]) < guideLinesThreshold) {
            newVerticals.push([shapeBox[key], 0, shapeBox[key], stageHeight]);
          }
        });

        ["top", "centerY", "bottom"].forEach((key) => {
          if (Math.abs(box[key] - shapeBox[key]) < guideLinesThreshold) {
            newHorizontals.push([0, shapeBox[key], stageWidth, shapeBox[key]]);
          }
        });
      }

      ["left", "centerX", "right"].forEach((key) => {
        if (Math.abs(box[key] - stageBox[key]) < guideLinesThreshold) {
          newVerticals.push([stageBox[key], 0, stageBox[key], stageHeight]);
        }
      });

      ["top", "centerY", "bottom"].forEach((key) => {
        if (Math.abs(box[key] - stageBox[key]) < guideLinesThreshold) {
          newHorizontals.push([0, stageBox[key], stageWidth, stageBox[key]]);
        }
      });

      guideLines.updateProp({
        horizontalLines: newHorizontals,
        verticalLines: newVerticals,
      });
    },
    [
      shapeRefs,
      shapeList,
      selectedIds,
      stageWidth,
      stageHeight,
      guideLinesThreshold,
      getGuideLines,
    ]
  );

  const handleAppliedProp = React.useCallback(
    (shapeAPI: KonvaShapeAPI, reason: RenderReason): void => {
      if (reason === "apply-prop") {
        const box: KonvaShapeBox = shapeAPI.getShape()?.box;
        if (!box) {
          return;
        }

        const newScaleX: number = box.right / stageWidth;
        const newScaleY: number = box.bottom / stageHeight;
        const expandRatio: number = 1.05;

        // Expand
        if (newScaleX > 1 && newScaleY > 1) {
          if (newScaleX > newScaleY) {
            expandStage(box.right * expandRatio, false);
          } else {
            expandStage(box.bottom * expandRatio, true);
          }
        } else if (newScaleX > 1) {
          expandStage(box.right * expandRatio, false);
        } else if (newScaleY > 1) {
          expandStage(box.bottom * expandRatio, true);
        }
      } else if (reason === "transform-end" || reason === "commit") {
        const currentShape: KonvaShape = shapeAPI.getShape();
        if (!currentShape) {
          return;
        }

        // Update shape
        updateShape(currentShape, true, true);
      } else if (reason === "drag-end") {
        const guideLines: KonvaGuideLinesAPI = getGuideLines();
        if (!guideLines) {
          return;
        }

        // Auto stick
        if (guideLinesStick) {
          const currentShape: KonvaShape = shapeAPI.getShape();

          // Calculate box
          let box: KonvaShapeBox = currentShape?.box;

          const _selectedIds: string[] = selectedIds
            ? Object.keys(selectedIds)
            : undefined;
          if (shapeRefs && _selectedIds?.length) {
            const shapes: KonvaShape[] = [];

            _selectedIds.forEach((item) => {
              const shape: KonvaShape = shapeRefs[item]?.getShape();
              if (shape) {
                shapes.push(shape);
              }
            });

            box = calculateGroupShapeBox(shapes);
          }

          // Calculate offset
          if (box) {
            let offSetX: number = 0;
            let offSetY: number = 0;

            const { verticalLines = [], horizontalLines = [] } =
              guideLines.getShape();

            let minDiffX: number = guideLinesThreshold;
            let minDiffY: number = guideLinesThreshold;

            // Snap x
            verticalLines.forEach(([x]) => {
              [x - box.left, x - box.centerX, x - box.right].forEach((d) => {
                const abs: number = Math.abs(d);
                if (abs < minDiffX) {
                  minDiffX = abs;

                  offSetX = d;
                }
              });
            });

            // Snap y
            horizontalLines.forEach(([, y]) => {
              [y - box.top, y - box.centerY, y - box.bottom].forEach((d) => {
                const abs: number = Math.abs(d);
                if (abs < minDiffY) {
                  minDiffY = abs;

                  offSetY = d;
                }
              });
            });

            // Move shape
            moveShapes(
              _selectedIds?.length ? _selectedIds : [currentShape.id],
              offSetX,
              offSetY
            );
          }
        }

        // Reset guide lines
        guideLines.updateProp({
          horizontalLines: [],
          verticalLines: [],
        });
      }
    },
    [
      shapeRefs,
      selectedIds,
      stageWidth,
      stageHeight,
      guideLinesThreshold,
      guideLinesStick,
      getGuideLines,
      moveShapes,
      expandStage,
      updateShape,
    ]
  );

  const handleOnMounted = React.useCallback(
    (id: string, shapeAPI: KonvaShapeAPI): void => {
      if (!shapeRefs[id]) {
        shapeRefs[id] = shapeAPI;
      }
    },
    [shapeRefs]
  );

  const handleOnUnMounted = React.useCallback(
    (id: string): void => {
      delete shapeRefs[id];
    },
    [shapeRefs]
  );

  // Update transformer
  React.useEffect(() => {
    const transformer: KonvaTransformerAPI = getTransformer?.();
    if (!transformer) {
      return;
    }

    const transformerNodes: Konva.Node[] = [];

    if (!freeDrawingMode && shapeRefs) {
      Object.keys(selectedIds ?? {}).forEach((item) => {
        const node: Konva.Node = shapeRefs[item]?.getNode();
        if (node) {
          transformerNodes.push(node);
        }
      });
    }

    transformer.updateProp({
      nodes: transformerNodes,
    });
  }, [
    shapeRefs,
    selectedIds,
    freeDrawingMode,
    getTransformer
  ]);

  const renderedShapeList = React.useMemo(() => {
    return shapeList?.map((item) => {
      const isSelected: boolean = !!selectedIds?.[item.id];

      switch (item.type) {
        default: {
          return <></>;
        }

        case "rectangle": {
          return (
            <KonvaRectangle
              onClick={handleShapeClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isSelected={isSelected}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "ellipse": {
          return (
            <KonvaEllipse
              onClick={handleShapeClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isSelected={isSelected}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "convex-polygon": {
          return (
            <KonvaConvexPolygon
              onClick={handleShapeClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isSelected={isSelected}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "concave-polygon": {
          return (
            <KonvaConcavePolygon
              onClick={handleShapeClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isSelected={isSelected}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "ring": {
          return (
            <KonvaRing
              onClick={handleShapeClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isSelected={isSelected}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "wedge": {
          return (
            <KonvaWedge
              onClick={handleShapeClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isSelected={isSelected}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "circle": {
          return (
            <KonvaCircle
              onClick={handleShapeClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isSelected={isSelected}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "arrow": {
          return (
            <KonvaArrow
              onClick={handleShapeClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isSelected={isSelected}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "image": {
          return (
            <KonvaImage
              onClick={handleShapeClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isSelected={isSelected}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "video": {
          return (
            <KonvaVideo
              onClick={handleShapeClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isSelected={isSelected}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "line": {
          return (
            <KonvaLine
              onClick={handleShapeClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isSelected={isSelected}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "text": {
          return (
            <KonvaText
              onClick={handleShapeClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isSelected={isSelected}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "free-drawing": {
          return (
            <KonvaFreeDrawing
              onClick={handleShapeClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isSelected={isSelected && !freeDrawingMode}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "path": {
          return (
            <KonvaPath
              onClick={handleShapeClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isSelected={isSelected}
              shapeOption={item}
              key={item.id}
            />
          );
        }
      }
    });
  }, [
    shapeList,
    selectedIds,
    freeDrawingMode,
    handleShapeClick,
    handleShapeMouseOver,
    handleShapeMouseLeave,
    handleShapeDragMove,
    handleAppliedProp,
    handleOnMounted,
    handleOnUnMounted,
  ]);

  return <>{renderedShapeList}</>;
});
