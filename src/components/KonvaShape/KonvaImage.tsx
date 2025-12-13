import { parseHexToRGBAString } from "../../utils/Color";
import { Portal } from "react-konva-utils";
import { Image } from "react-konva";
import Konva from "konva";
import React from "react";
import {
  createShapeBox,
  createLineDash,
  createFilter,
} from "../../utils/Shapes";
import {
  KonvaShapeClip,
  KonvaShapeProp,
  KonvaShapeAPI,
  RenderReason,
  KonvaShape,
} from "./Types";

export const KonvaImage = React.memo(
  (prop: KonvaShapeProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Image>(undefined);
    const currentPropRef = React.useRef<KonvaShapeProp>(prop);
    const [isEnabled, setIsEnabled] = React.useState<boolean>(false);

    // Store crop
    const cropElementNodeRef = React.useRef<Konva.Shape>(undefined);
    const cropImageNodeRef = React.useRef<Konva.Image>(undefined);
    const previousClipRef = React.useRef<KonvaShapeClip>(undefined);
    const previousIsCroppedRef = React.useRef<boolean>(false);

    // Update crop element
    const updateCropElement = React.useCallback((): void => {
      if (
        currentPropRef.current.isEditted &&
        cropElementNodeRef.current &&
        cropImageNodeRef.current &&
        nodeRef.current
      ) {
        const shapeOption: KonvaShape = currentPropRef.current.shapeOption;

        shapeOption.clip = {
          ...shapeOption.clip,
          ...nodeRef.current
            .getAbsoluteTransform()
            .copy()
            .invert()
            .multiply(cropImageNodeRef.current.getAbsoluteTransform())
            .decompose(),
        };

        cropElementNodeRef.current.setAttrs(shapeOption.clip);
      }
    }, []);

    // Apply prop
    const applyProp = React.useCallback((reason?: RenderReason): void => {
      const prop: KonvaShapeProp = currentPropRef.current;
      const shapeOption: KonvaShape = prop.shapeOption;

      // Update offset
      shapeOption.offsetX = shapeOption.width / 2;
      shapeOption.offsetY = shapeOption.height / 2;

      const node: Konva.Image = nodeRef.current;
      if (node) {
        // Update node attrs
        node.setAttrs({
          ...shapeOption,
          draggable: shapeOption.draggable && prop.isSelected,
          image: shapeOption.image,
          fill: parseHexToRGBAString(
            shapeOption.fill as string,
            shapeOption.fillOpacity
          ),
          stroke: parseHexToRGBAString(
            shapeOption.stroke as string,
            shapeOption.strokeOpacity
          ),
          dash: createLineDash(shapeOption.lineStyle),
          filters: createFilter(shapeOption),
        });

        // Update shape box
        shapeOption.box = createShapeBox(node);

        // Init clip
        if (!cropElementNodeRef.current) {
          cropElementNodeRef.current = new Konva.Shape(shapeOption.clip);

          cropImageNodeRef.current.setAttrs({
            ...node
              .getLayer()
              .getAbsoluteTransform()
              .copy()
              .invert()
              .multiply(node.getAbsoluteTransform())
              .multiply(cropElementNodeRef.current.getAbsoluteTransform())
              .decompose(),
            draggable: currentPropRef.current.isEditted,
            visible: currentPropRef.current.isEditted,
            image: node.image(),
            width: cropElementNodeRef.current.width(),
            height: cropElementNodeRef.current.height(),
          });
        }

        // Handle clip
        if (previousClipRef.current && !shapeOption.clip) {
          cropImageNodeRef.current?.visible(false);

          shapeOption.clip = {
            width: shapeOption.width,
            height: shapeOption.height,
            x: 0,
            y: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            skewX: 0,
            skewY: 0,
          };

          cropElementNodeRef.current.setAttrs(shapeOption.clip);
        } else if (previousIsCroppedRef.current && !prop.isEditted) {
          cropImageNodeRef.current?.visible(false);
        } else if (!previousIsCroppedRef.current && prop.isEditted) {
          cropImageNodeRef.current.setAttrs({
            ...node
              .getLayer()
              .getAbsoluteTransform()
              .copy()
              .invert()
              .multiply(node.getAbsoluteTransform())
              .multiply(cropElementNodeRef.current.getAbsoluteTransform())
              .decompose(),
            draggable: currentPropRef.current.isEditted,
            visible: currentPropRef.current.isEditted,
            image: node.image(),
            width: cropElementNodeRef.current.width(),
            height: cropElementNodeRef.current.height(),
          });

          node.clearCache();
        }

        // Cache
        if (!prop.isEditted && (shapeOption.width || shapeOption.height)) {
          node.cache();
        }
      }

      // Store previous clip
      previousClipRef.current = shapeOption.clip;
      previousIsCroppedRef.current = prop.isEditted;

      // Call callback function
      prop.onAppliedProp?.(shapeAPI, reason);
    }, []);

    // Update prop
    const updateProp = React.useCallback((prop?: KonvaShapeProp): void => {
      if (prop) {
        Object.assign(currentPropRef.current, prop);
      }

      applyProp("apply-prop");
    }, []);

    // Update shape
    const updateShape = React.useCallback((shape?: KonvaShape): void => {
      if (shape) {
        Object.assign(currentPropRef.current.shapeOption, shape);
      }

      applyProp("apply-prop");
    }, []);

    // Get stage
    const getStage = React.useCallback((): Konva.Stage => {
      return nodeRef.current?.getStage();
    }, []);

    // Get node
    const getNode = React.useCallback((): Konva.Image => {
      return nodeRef.current;
    }, []);

    // Get prop
    const getShape = React.useCallback((): KonvaShape => {
      return currentPropRef.current.shapeOption;
    }, []);

    // Shape API
    const shapeAPI: KonvaShapeAPI = React.useMemo(
      () => ({
        updateProp,
        updateShape,
        getStage,
        getNode,
        getShape,
      }),
      []
    );

    // Update shape
    React.useEffect(() => {
      currentPropRef.current = prop;

      applyProp("apply-prop");

      // Call callback function
      prop.onMounted?.(prop.shapeOption.id, shapeAPI);

      return () => {
        // Call callback function
        prop.onUnMounted?.(prop.shapeOption.id);
      };
    }, [prop]);

    const handleClick = React.useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>): void => {
        // Call callback function
        currentPropRef.current.onClick?.(e, shapeAPI);
      },
      []
    );

    const handleDblClick = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onDblClick?.(shapeAPI);
    }, []);

    const handleMouseDown = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onMouseDown?.(shapeAPI);
    }, []);

    const handleMouseUp = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onMouseUp?.(shapeAPI);
    }, []);

    const handleDragMove = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Image = e.target as Konva.Image;
        if (node) {
          Object.assign(currentPropRef.current.shapeOption, {
            x: node.x(),
            y: node.y(),
            box: createShapeBox(node),
          });
        }

        updateCropElement();

        // Call callback function
        currentPropRef.current.onDragMove?.(shapeAPI);
      },
      []
    );

    const handleDragEnd = React.useCallback((): void => {
      setIsEnabled(false);

      // Call callback function
      currentPropRef.current.onAppliedProp?.(shapeAPI, "drag-end");
    }, []);

    const handleTransformEnd = React.useCallback(
      (e: Konva.KonvaEventObject<Event>): void => {
        const node: Konva.Image = e.target as Konva.Image;
        if (node) {
          Object.assign(currentPropRef.current.shapeOption, {
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            skewX: node.skewX(),
            skewY: node.skewY(),
            x: node.x(),
            y: node.y(),
          });
        }

        // Call callback function
        currentPropRef.current.onAppliedProp?.(shapeAPI, "transform-end");
      },
      []
    );

    const handleMouseOver = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onMouseOver?.(shapeAPI);
    }, []);

    const handleMouseLeave = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onMouseLeave?.(shapeAPI);
    }, []);

    const handleScene = React.useCallback(
      (context: Konva.Context, shape: Konva.Shape): void => {
        const img: CanvasImageSource = (shape as Konva.Image).image();
        if (!img) {
          return;
        }

        let width: number = shape.width();
        let height: number = shape.height();

        context.save();

        if (cropElementNodeRef.current) {
          width = cropElementNodeRef.current.width();
          height = cropElementNodeRef.current.height();

          const m: number[] = cropElementNodeRef.current
            .getAbsoluteTransform()
            .getMatrix();
          context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }

        context.rect(0, 0, width, height);
        context.drawImage(img, 0, 0, width, height);

        context.restore();

        context.fillStrokeShape(shape);
      },
      []
    );

    return (
      <Portal selector={"#shapes"} enabled={isEnabled}>
        <Image
          id={`${prop.shapeOption.id}-image`}
          listening={true}
          ref={cropImageNodeRef}
          image={undefined}
          opacity={0.75}
          onDragMove={updateCropElement}
          onTransform={updateCropElement}
        />

        <Image
          listening={true}
          ref={nodeRef}
          image={undefined}
          onClick={handleClick}
          onDblClick={handleDblClick}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          onDragMove={handleDragMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onDragEnd={handleDragEnd}
          onTransform={updateCropElement}
          onTransformEnd={handleTransformEnd}
          sceneFunc={handleScene}
        />
      </Portal>
    );
  }
);
