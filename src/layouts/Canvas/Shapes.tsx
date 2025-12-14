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
  KonvaMultiLine,
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
  useDrawingContext,
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
    expandStage,
    setPointerStyle,
  } = useStageContext();

  const {
    shapeList,
    edittedId,
    shapeRefs,
    transformerRefs,
    selectedIds,
    selectedGroupIds,
    singleSelectedIds,
    moveShapes,
    updateShape,
    updateEdittedId,
    updateSelectedIds,
    updateSingleSelectedIds,
  } = useShapesContext();

  const { drawingMode } = useDrawingContext();

  const hiddenNodesRef = React.useRef<Konva.Node[]>(undefined);

  const handleShapeClick = React.useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>, shapeAPI: KonvaShapeAPI): void => {
      if (drawingMode) {
        return;
      }

      const shape: KonvaShape = shapeAPI.getShape();

      if (selectedGroupIds && selectedGroupIds === shape.groupIds) {
        // Set single selected ids
        updateSingleSelectedIds(
          [shape.id],
          e.evt?.ctrlKey
            ? singleSelectedIds[shape.id]
              ? undefined
              : e.evt?.ctrlKey
                ? false
                : true
            : true
        );
      } else {
        // Set selected ids
        updateSelectedIds(
          shape.groupIds ? shape.groupIds.flat(Infinity) : [shape.id],
          e.evt?.ctrlKey
            ? selectedIds[shape.id]
              ? undefined
              : e.evt?.ctrlKey
                ? false
                : true
            : true
        );
      }
    },
    [
      drawingMode,
      selectedIds,
      singleSelectedIds,
      selectedGroupIds,
      updateSelectedIds,
      updateSingleSelectedIds,
    ]
  );

  const handleShapeDblClick = React.useCallback(
    (shapeAPI: KonvaShapeAPI): void => {
      if (drawingMode) {
        return;
      }

      updateEdittedId(shapeAPI.getShape().id);
    },
    [drawingMode, updateEdittedId]
  );

  const handleShapeMouseOver = React.useCallback(
    (shapeAPI: KonvaShapeAPI): void => {
      if (drawingMode) {
        return;
      }

      // Set cursor style
      setPointerStyle(
        selectedIds?.[shapeAPI.getShape().id] ? "move" : "pointer"
      );
    },
    [drawingMode, selectedIds, setPointerStyle]
  );

  const handleShapeMouseLeave = React.useCallback((): void => {
    if (drawingMode) {
      return;
    }

    // Reset cursor style
    setPointerStyle();
  }, [drawingMode, setPointerStyle]);

  const handleShapeDragMove = React.useCallback(
    (shapeAPI: KonvaShapeAPI): void => {
      // Set guide lines
      const newHorizontals: number[][] = [];
      const newVerticals: number[][] = [];

      // Set ids map
      const idsMap: Record<string, boolean> = singleSelectedIds[
        shapeAPI.getShape().id
      ]
        ? singleSelectedIds
        : selectedIds;

      const shapes: KonvaShape[] = [];

      for (const id in idsMap) {
        const shape: KonvaShape = shapeRefs[id]?.getShape();
        if (shape) {
          shapes.push(shape);
        }
      }

      // Calculate guide lines
      const box: KonvaShapeBox = calculateGroupShapeBox(shapes);
      if (box) {
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
          if (idsMap[shape.id] || !shapeBox) {
            continue;
          }

          ["left", "centerX", "right"].forEach((key) => {
            if (Math.abs(box[key] - shapeBox[key]) < guideLinesThreshold) {
              newVerticals.push([shapeBox[key], 0, shapeBox[key], stageHeight]);
            }
          });

          ["top", "centerY", "bottom"].forEach((key) => {
            if (Math.abs(box[key] - shapeBox[key]) < guideLinesThreshold) {
              newHorizontals.push([
                0,
                shapeBox[key],
                stageWidth,
                shapeBox[key],
              ]);
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
      }

      getGuideLines().updateProp({
        horizontalLines: newHorizontals,
        verticalLines: newVerticals,
      });
    },
    [
      shapeRefs,
      shapeList,
      selectedIds,
      singleSelectedIds,
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
      } else if (reason === "transform-end") {
        // Update shape
        updateShape(shapeAPI.getShape(), true, true);
      } else if (reason === "commit") {
        // Update shape
        updateShape(shapeAPI.getShape(), true, true);

        // Reset editted id
        updateEdittedId(undefined);
      } else if (reason === "drag-end") {
        const guideLines: KonvaGuideLinesAPI = getGuideLines();

        // Auto stick
        if (guideLinesStick) {
          // Set ids map
          const idsMap: Record<string, boolean> = singleSelectedIds[
            shapeAPI.getShape().id
          ]
            ? singleSelectedIds
            : selectedIds;

          const shapes: KonvaShape[] = [];

          for (const id in idsMap) {
            const shape: KonvaShape = shapeRefs[id]?.getShape();
            if (shape) {
              shapes.push(shape);
            }
          }

          // Calculate guide lines
          const box: KonvaShapeBox = calculateGroupShapeBox(shapes);
          if (box) {
            // Calculate offset
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
            moveShapes(Object.keys(idsMap), offSetX, offSetY);
          }
        }

        // Reset guide lines
        guideLines.updateProp({
          horizontalLines: [],
          verticalLines: [],
        });
      } else if (reason === "control-drag-end") {
        // Update shape
        updateShape(shapeAPI.getShape(), true, true);
      }
    },
    [
      shapeRefs,
      stageWidth,
      selectedIds,
      stageHeight,
      singleSelectedIds,
      guideLinesThreshold,
      guideLinesStick,
      updateEdittedId,
      getGuideLines,
      expandStage,
      updateShape,
      moveShapes,
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

  const handleShapeMouseDown = React.useCallback(
    (shapeAPI: KonvaShapeAPI): void => {
      const id: string = shapeAPI.getShape().id;

      if (singleSelectedIds[id]) {
        const transformer: Konva.Transformer =
          transformerRefs["transformer"].getNode();

        hiddenNodesRef.current = transformer.nodes();

        transformer.nodes([]);
      } else if (selectedIds[id]) {
        const transformer: Konva.Transformer =
          transformerRefs["single-transformer"].getNode();

        hiddenNodesRef.current = transformer.nodes();

        transformer.nodes([]);
      }
    },
    [transformerRefs, selectedIds, singleSelectedIds]
  );

  const handleShapeMouseUp = React.useCallback(
    (shapeAPI: KonvaShapeAPI): void => {
      const id: string = shapeAPI.getShape().id;

      if (singleSelectedIds[id]) {
        transformerRefs["transformer"].getNode().nodes(hiddenNodesRef.current);

        hiddenNodesRef.current = undefined;
      } else if (selectedIds[id]) {
        transformerRefs["single-transformer"]
          .getNode()
          .nodes(hiddenNodesRef.current);

        hiddenNodesRef.current = undefined;
      }
    },
    [transformerRefs, selectedIds, singleSelectedIds]
  );

  // Update cropper/transformer
  React.useEffect(() => {
    if (
      !transformerRefs ||
      !transformerRefs["cropper"] ||
      !transformerRefs["transformer"] ||
      !transformerRefs["single-transformer"]
    ) {
      return;
    }

    const cropperNodes: Konva.Node[] = [];
    const transformerNodes: Konva.Node[] = [];
    const singleTransformerNodes: Konva.Node[] = [];

    if (!drawingMode && shapeRefs && selectedIds && singleSelectedIds) {
      if (edittedId) {
        const node: Konva.Node = shapeRefs[edittedId]?.getNode();
        if (node) {
          const cropNode: Konva.Node = node
            .getStage()
            ?.findOne(`#${edittedId}-image`);
          if (cropNode) {
            cropperNodes.push(cropNode);
          }
        }
      }

      for (const id in selectedIds) {
        const node: Konva.Node = shapeRefs[id]?.getNode();
        if (node) {
          transformerNodes.push(node);
        }
      }

      for (const id in singleSelectedIds) {
        const node: Konva.Node = shapeRefs[id]?.getNode();
        if (node) {
          singleTransformerNodes.push(node);
        }
      }
    }

    transformerRefs["cropper"].getNode().nodes(cropperNodes);
    transformerRefs["transformer"].getNode().nodes(transformerNodes);
    transformerRefs["single-transformer"]
      .getNode()
      .nodes(singleTransformerNodes);
  }, [
    shapeRefs,
    transformerRefs,
    edittedId,
    selectedIds,
    singleSelectedIds,
    drawingMode,
  ]);

  const renderedShapeList = React.useMemo(() => {
    return shapeList?.map((item) => {
      switch (item.type) {
        default: {
          return;
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isSelected={!!selectedIds?.[item.id]}
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isSelected={!!selectedIds?.[item.id]}
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isSelected={!!selectedIds?.[item.id]}
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isSelected={!!selectedIds?.[item.id]}
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isSelected={!!selectedIds?.[item.id]}
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isSelected={!!selectedIds?.[item.id]}
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isSelected={!!selectedIds?.[item.id]}
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isSelected={!!selectedIds?.[item.id]}
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isEditted={edittedId === item.id}
              isSelected={!!selectedIds?.[item.id]}
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isSelected={!!selectedIds?.[item.id]}
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isSelected={!!selectedIds?.[item.id]}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "text": {
          return (
            <KonvaText
              onClick={handleShapeClick}
              onDblClick={handleShapeDblClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isEditted={edittedId === item.id}
              isSelected={!!selectedIds?.[item.id]}
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isSelected={!drawingMode && !!selectedIds?.[item.id]}
              shapeOption={item}
              key={item.id}
            />
          );
        }

        case "multi-line": {
          return (
            <KonvaMultiLine
              onClick={handleShapeClick}
              onDblClick={handleShapeDblClick}
              onMounted={handleOnMounted}
              onUnMounted={handleOnUnMounted}
              onMouseOver={handleShapeMouseOver}
              onMouseLeave={handleShapeMouseLeave}
              onDragMove={handleShapeDragMove}
              onAppliedProp={handleAppliedProp}
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isEditted={edittedId === item.id}
              isSelected={!drawingMode && !!selectedIds?.[item.id]}
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isSelected={!!selectedIds?.[item.id]}
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isEditted={edittedId === item.id}
              isSelected={!!selectedIds?.[item.id]}
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
              onMouseDown={handleShapeMouseDown}
              onMouseUp={handleShapeMouseUp}
              isEditted={edittedId === item.id}
              isSelected={!!selectedIds?.[item.id]}
              shapeOption={item}
              key={item.id}
            />
          );
        }
      }
    });
  }, [
    shapeList,
    edittedId,
    selectedIds,
    drawingMode,
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
