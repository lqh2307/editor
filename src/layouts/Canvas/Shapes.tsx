import { KonvaTransformerAPI } from "../../components/KonvaTransformer";
import { KonvaGuideLinesAPI } from "../../components/KonvaGuideLines";
import { calculateGroupShapeBox } from "../../utils/Shapes";
import Konva from "konva";
import React from "react";
import {
  KonvaQuadraticCurve,
  KonvaConcavePolygon,
  KonvaConvexPolygon,
  KonvaBezierCurve,
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
    getSingleTransformer,
    getCropper,
    getTransformer,
    expandStage,
    setPointerStyle,
  } = useStageContext();

  const {
    shapeList,
    croppedIds,
    selectedIds,
    singleIds,
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

      const shape: KonvaShape = shapeAPI.getShape();

      // Set selected ids
      updateSelectedIds(
        {
          selecteds: shape.groupIds ? shape.groupIds : [shape.id],
        },
        e.evt?.ctrlKey ? false : true
      );
    },
    [freeDrawingMode, updateSelectedIds]
  );

  const handleShapeDblClick = React.useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>, shapeAPI: KonvaShapeAPI): void => {
      if (freeDrawingMode) {
        return;
      }

      const shape: KonvaShape = shapeAPI.getShape();

      // Set selected ids
      updateSelectedIds(
        {
          selecteds: shape.groupIds ? shape.groupIds : [shape.id],
        },
        e.evt?.ctrlKey ? false : true
      );
    },
    [freeDrawingMode, updateSelectedIds]
  );

  const handleShapeMouseOver = React.useCallback(
    (shapeAPI: KonvaShapeAPI): void => {
      if (freeDrawingMode) {
        return;
      }

      // Set cursor style
      setPointerStyle(
        selectedIds?.[shapeAPI.getShape().id] ? "move" : "pointer"
      );
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

      const _selectedIds: string[] = Object.keys(selectedIds);
      if (_selectedIds.length) {
        const shapes: KonvaShape[] = [];

        _selectedIds.forEach((item) => {
          const shape: KonvaShape = shapeRefs[item]?.getShape();
          if (shape) {
            shapes.push(shape);
          }
        });

        box = calculateGroupShapeBox(shapes);
      } else {
        box = shapeAPI.getShape().box;
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
        if (selectedIds[shape.id] || !shapeBox) {
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
        const box: KonvaShapeBox = shapeAPI.getShape().box;
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
        // Update shape
        updateShape(shapeAPI.getShape(), true, true);
      } else if (reason === "drag-end") {
        const guideLines: KonvaGuideLinesAPI = getGuideLines();
        if (!guideLines) {
          return;
        }

        // Auto stick
        if (guideLinesStick) {
          const currentShape: KonvaShape = shapeAPI.getShape();

          // Calculate box
          let box: KonvaShapeBox = currentShape.box;

          const _selectedIds: string[] = Object.keys(selectedIds);
          if (_selectedIds.length) {
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
              _selectedIds.length ? _selectedIds : [currentShape.id],
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
      if (shapeRefs[id]) {
        delete shapeRefs[id];
      }
    },
    [shapeRefs]
  );

  // Update cropper/transformer
  React.useEffect(() => {
    const singleTransformer: KonvaTransformerAPI = getSingleTransformer?.();
    const cropper: KonvaTransformerAPI = getCropper?.();
    const transformer: KonvaTransformerAPI = getTransformer?.();
    if (!singleTransformer || !cropper || !transformer) {
      return;
    }

    const singleTransformerNodes: Konva.Node[] = [];
    const cropperNodes: Konva.Node[] = [];
    const transformerNodes: Konva.Node[] = [];

    if (!freeDrawingMode && shapeRefs && croppedIds && selectedIds) {
      Object.keys(selectedIds).forEach((id) => {
        const node: Konva.Node = shapeRefs[id]?.getNode();
        if (node) {
          if (croppedIds[id]) {
            const cropNode: Konva.Node = node
              .getStage()
              ?.findOne(`#${id}-image`);
            if (cropNode) {
              cropperNodes.push(cropNode);
            }
          } else if (singleIds[id]) {
            singleTransformerNodes.push(node);
          }

          transformerNodes.push(node);
        }
      });
    }

    cropper.updateProp({
      nodes: cropperNodes,
    });

    transformer.updateProp({
      nodes: transformerNodes,
    });

    singleTransformer.updateProp({
      nodes: singleTransformerNodes,
    });
  }, [
    shapeRefs,
    selectedIds,
    freeDrawingMode,
    getSingleTransformer,
    getCropper,
    getTransformer,
  ]);

  const renderedShapeList = React.useMemo(() => {
    return shapeList?.map((item) => {
      const isSelected: boolean = !!selectedIds?.[item.id];
      const isCropped: boolean = !!croppedIds?.[item.id];

      switch (item.type) {
        default: {
          return <></>;
        }

        case "rectangle": {
          return (
            <KonvaRectangle
              onClick={handleShapeClick}
              onDblClick={handleShapeDblClick}
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
              onDblClick={handleShapeDblClick}
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
              onDblClick={handleShapeDblClick}
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
              onDblClick={handleShapeDblClick}
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
              onDblClick={handleShapeDblClick}
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
              onDblClick={handleShapeDblClick}
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
              onDblClick={handleShapeDblClick}
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
              onDblClick={handleShapeDblClick}
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
              onDblClick={handleShapeDblClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              isCropped={isCropped}
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
              onDblClick={handleShapeDblClick}
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
              onDblClick={handleShapeDblClick}
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
              onDblClick={handleShapeDblClick}
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
              onDblClick={handleShapeDblClick}
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

        case "quadratic-curve": {
          return (
            <KonvaQuadraticCurve
              onClick={handleShapeClick}
              onDblClick={handleShapeDblClick}
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

        case "bezier-curve": {
          return (
            <KonvaBezierCurve
              onClick={handleShapeClick}
              onDblClick={handleShapeDblClick}
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
