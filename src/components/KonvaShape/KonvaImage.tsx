import { createShapeBox, createFilter } from "../../utils/Shapes";
import { parseHexToRGBAString } from "../../utils/Color";
import { KonvaShape, KonvaShapeProp } from "./Types";
import { Portal } from "react-konva-utils";
import { Image } from "react-konva";
import Konva from "konva";
import React from "react";

export const KonvaImage = React.memo(
  (prop: KonvaShapeProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Image>(undefined);
    const currentPropRef = React.useRef<KonvaShapeProp>(prop);
    const [isEnabled, setIsEnabled] = React.useState<boolean>(false);
    const cropElementRef = React.useRef<Konva.Shape>(undefined);
    const cropImageRef = React.useRef<Konva.Image>(undefined);
    const isCroppingRef = React.useRef<boolean>(false);

    const updateCropElement = React.useCallback((): void => {
      if (
        isCroppingRef.current &&
        cropElementRef.current &&
        cropImageRef.current &&
        nodeRef.current
      ) {
        cropElementRef.current.setAttrs(
          nodeRef.current
            .getAbsoluteTransform()
            .copy()
            .invert()
            .multiply(cropImageRef.current.getAbsoluteTransform())
            .decompose()
        );
      }
    }, []);

    const startCrop = React.useCallback((): void => {
      const node: Konva.Image = nodeRef.current;
      if (!node) {
        return;
      }

      if (!cropElementRef.current) {
        cropElementRef.current = new Konva.Shape({
          width: node.width(),
          height: node.height(),
        });
      }

      if (cropImageRef.current) {
        const layer: Konva.Layer = node.getLayer();

        cropImageRef.current.setAttrs({
          ...layer
            .getAbsoluteTransform()
            .copy()
            .invert()
            .multiply(node.getAbsoluteTransform())
            .multiply(cropElementRef.current.getAbsoluteTransform())
            .decompose(),
          visible: true,
          image: node.image(),
          width: cropElementRef.current.width(),
          height: cropElementRef.current.height(),
        });

        const cropper: Konva.Transformer = layer.findOne(
          "#cropper"
        ) as Konva.Transformer;
        if (cropper) {
          cropper.nodes([cropImageRef.current]);
        }
      }

      node.clearCache();

      isCroppingRef.current = true;
    }, []);

    const endCrop = React.useCallback((restore?: boolean): void => {
      if (nodeRef.current) {
        (
          nodeRef.current.getLayer().findOne("#cropper") as Konva.Transformer
        )?.nodes([]);

        if (
          currentPropRef.current.shapeOption.width ||
          currentPropRef.current.shapeOption.height
        ) {
          nodeRef.current.cache();
        }
      }

      cropImageRef.current?.visible(false);

      if (restore && cropElementRef.current) {
        cropElementRef.current.remove();
        cropElementRef.current = undefined;
      }

      isCroppingRef.current = false;
    }, []);

    React.useEffect(() => {
      currentPropRef.current = prop;

      applyProp();

      // Call callback function
      prop.onMounted?.(prop.shapeOption.id, {
        updateProp,
        updateShape,
        getNode,
        getShape,
        startCrop,
        endCrop,
      });

      return () => {
        // Call callback function
        prop.onUnMounted?.(prop.shapeOption.id);
      };
    }, [prop]);

    // Apply prop
    const applyProp = React.useCallback((): void => {
      const node: Konva.Image = nodeRef.current;
      if (node) {
        const shapeOption: KonvaShape = currentPropRef.current.shapeOption;

        // Update offset
        shapeOption.offsetX = shapeOption.width / 2;
        shapeOption.offsetY = shapeOption.height / 2;

        // Update node attrs
        node.setAttrs({
          ...shapeOption,
          draggable: currentPropRef.current.isSelected,
          image: shapeOption.image,
          fill: parseHexToRGBAString(
            shapeOption.fill as string,
            shapeOption.fillOpacity
          ),
          stroke: parseHexToRGBAString(
            shapeOption.stroke as string,
            shapeOption.strokeOpacity
          ),
          filters: createFilter(
            shapeOption.grayscale,
            shapeOption.invert,
            shapeOption.sepia,
            shapeOption.solarize
          ),
        });

        // Update shape box
        shapeOption.box = createShapeBox(node);

        // Cache
        if (
          !isCroppingRef.current &&
          (shapeOption.width || shapeOption.height)
        ) {
          node.cache();
        }
      }

      // Call callback function
      currentPropRef.current.onAppliedProp?.(
        {
          updateProp,
          updateShape,
          getNode,
          getShape,
        },
        "apply-prop"
      );
    }, []);

    // Update prop
    const updateProp = React.useCallback((prop?: KonvaShapeProp): void => {
      if (prop) {
        Object.assign(currentPropRef.current, prop);
      }

      applyProp();
    }, []);

    // Update shape
    const updateShape = React.useCallback((shape?: KonvaShape): void => {
      if (shape) {
        Object.assign(currentPropRef.current.shapeOption, shape);
      }

      applyProp();
    }, []);

    // Get node
    const getNode = React.useCallback((): Konva.Image => {
      return nodeRef.current;
    }, []);

    // Get prop
    const getShape = React.useCallback((): KonvaShape => {
      return currentPropRef.current.shapeOption;
    }, []);

    const handleClick = React.useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>): void => {
        // Call callback function
        currentPropRef.current.onClick?.(e, {
          updateProp,
          updateShape,
          getNode,
          getShape,
        });
      },
      []
    );

    const handleDragMove = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        const node: Konva.Image = e.target as Konva.Image;
        if (node) {
          Object.assign(currentPropRef.current.shapeOption, {
            ...node.position(),
            box: createShapeBox(node),
          });
        }

        updateCropElement();

        // Call callback function
        currentPropRef.current.onDragMove?.({
          updateProp,
          updateShape,
          getNode,
          getShape,
        });
      },
      []
    );

    const handleDragEnd = React.useCallback((): void => {
      setIsEnabled(false);

      // Call callback function
      currentPropRef.current.onAppliedProp?.(
        {
          updateProp,
          updateShape,
          getNode,
          getShape,
        },
        "drag-end"
      );
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
        currentPropRef.current.onAppliedProp?.(
          {
            updateProp,
            updateShape,
            getNode,
            getShape,
          },
          "transform-end"
        );
      },
      []
    );

    const handleMouseOver = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onMouseOver?.({
        updateProp,
        updateShape,
        getNode,
        getShape,
      });
    }, []);

    const handleMouseLeave = React.useCallback((): void => {
      // Call callback function
      currentPropRef.current.onMouseLeave?.({
        updateProp,
        updateShape,
        getNode,
        getShape,
      });
    }, []);

    const handleScene = React.useCallback(
      (context: Konva.Context, shape: Konva.Shape): void => {
        const img: CanvasImageSource = (shape as Konva.Image).image();
        if (!img) {
          return;
        }

        const width: number = shape.width();
        const height: number = shape.height();

        context.save();

        context.beginPath();
        context.rect(0, 0, width, height);
        context.clip();

        context.save();

        context.shadowColor = shape.shadowColor();
        context.shadowBlur = shape.shadowBlur();
        context.shadowOffsetX = shape.shadowOffsetX();
        context.shadowOffsetY = shape.shadowOffsetY();

        context.restore();

        if (cropElementRef.current) {
          context.save();

          const m = cropElementRef.current.getAbsoluteTransform().getMatrix();
          context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

          context.drawImage(
            img,
            0,
            0,
            cropElementRef.current.width(),
            cropElementRef.current.height()
          );

          context.restore();
        } else {
          context.drawImage(img, 0, 0, width, height);
        }

        context.fillStrokeShape(shape);

        context.restore();
      },
      []
    );

    return (
      <Portal selector={"#shapes"} enabled={isEnabled}>
        <Image
          listening={true}
          draggable={true}
          visible={false}
          ref={cropImageRef}
          image={undefined}
          opacity={0.5}
          onDragMove={updateCropElement}
          onTransform={updateCropElement}
        />

        <Image
          listening={true}
          ref={nodeRef}
          image={undefined}
          onClick={handleClick}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onTransform={updateCropElement}
          onTransformEnd={handleTransformEnd}
          sceneFunc={handleScene}
        />
      </Portal>
    );
  }
);
