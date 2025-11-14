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

    React.useEffect(() => {
      currentPropRef.current = prop;

      applyProp();

      // Call callback function
      prop.onMounted?.(prop.shapeOption.id, {
        updateProp,
        updateShape,
        getNode,
        getShape,
        resetCrop,
      });

      return () => {
        // Call callback function
        prop.onUnMounted?.(prop.shapeOption.id);
      };
    }, [prop]);

    const updateCropElement = () => {
      const node: Konva.Image = nodeRef.current;
      if (!node || !cropImageRef.current || !cropElementRef.current) {
        return;
      }

      const options = node
        .getAbsoluteTransform()
        .copy()
        .invert()
        .multiply(cropImageRef.current.getAbsoluteTransform())
        .decompose();

      cropElementRef.current.setAttrs(options);
    };

    const startCrop = () => {
      const node: Konva.Image = nodeRef.current;
      if (!node || cropImageRef.current) {
        return;
      }

      if (!cropElementRef.current) {
        cropElementRef.current = new Konva.Shape({
          width: node.width(),
          height: node.height(),
          skewX: node.skewX(),
          skewY: node.skewY(),
        });
      }

      const layer = node.getLayer();
      if (!layer) {
        return;
      }

      const options = layer
        .getAbsoluteTransform()
        .copy()
        .invert()
        .multiply(node.getAbsoluteTransform())
        .multiply(cropElementRef.current.getAbsoluteTransform())
        .decompose();

      cropImageRef.current = new Konva.Image({
        draggable: true,
        opacity: 0.5,
        ...options,
        image: node.image(),
        width: cropElementRef.current.width(),
        height: cropElementRef.current.height(),
      });

      layer.add(cropImageRef.current);

      (layer.findOne("#cropper") as Konva.Transformer)?.nodes([
        cropImageRef.current,
      ]);
    };

    const endCrop = () => {
      const node: Konva.Image = nodeRef.current;
      if (!node) {
        return;
      }

      (node.getLayer()?.findOne("#cropper") as Konva.Transformer)?.nodes([]);

      if (cropImageRef.current) {
        cropImageRef.current.remove();
        cropImageRef.current = null;
      }
    };

    const resetCrop = () => {
      if (cropImageRef.current) {
        cropImageRef.current.remove();
        cropImageRef.current = null;
      }

      if (cropElementRef.current) {
        cropElementRef.current.remove();
        cropElementRef.current = null;
      }
    };

    // Apply prop
    const applyProp = React.useCallback((): void => {
      const node: Konva.Image = nodeRef.current;
      if (!node) {
        return;
      }

      const prop: KonvaShapeProp = currentPropRef.current;

      // Update node attrs
      node.setAttrs({
        ...prop.shapeOption,
        draggable: prop.isSelected,
        image: prop.shapeOption.image,
        fill: parseHexToRGBAString(
          prop.shapeOption.fill as string,
          prop.shapeOption.fillOpacity
        ),
        stroke: parseHexToRGBAString(
          prop.shapeOption.stroke as string,
          prop.shapeOption.strokeOpacity
        ),
        filters: createFilter(
          prop.shapeOption.grayscale,
          prop.shapeOption.invert,
          prop.shapeOption.sepia,
          prop.shapeOption.solarize
        ),
      });

      // Update shape box
      prop.shapeOption.box = createShapeBox(node);

      // Cache
      if (node.width() || node.height()) {
        node.cache();
      }

      // Call callback function
      prop.onAppliedProp?.(
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
        if (!node) {
          return;
        }

        const prop: KonvaShapeProp = currentPropRef.current;

        Object.assign(prop.shapeOption, {
          ...node.position(),
          box: createShapeBox(node),
        });

        // Call callback function
        prop.onDragMove?.({
          updateProp,
          updateShape,
          getNode,
          getShape,
        });
      },
      []
    );

    const handleDragEnd = React.useCallback(
      (e: Konva.KonvaEventObject<DragEvent>): void => {
        setIsEnabled(false);

        const node: Konva.Image = e.target as Konva.Image;
        if (!node) {
          return;
        }

        const prop: KonvaShapeProp = currentPropRef.current;

        Object.assign(prop.shapeOption, {
          ...node.position(),
          box: createShapeBox(node),
        });

        // Call callback function
        prop.onAppliedProp?.(
          {
            updateProp,
            updateShape,
            getNode,
            getShape,
          },
          "drag-end"
        );
      },
      []
    );

    const handleTransformEnd = React.useCallback(
      (e: Konva.KonvaEventObject<Event>): void => {
        const node: Konva.Image = e.target as Konva.Image;
        if (!node) {
          return;
        }

        const scaleX: number = node.scaleX();
        const scaleY: number = node.scaleY();

        const newScaleX: number = scaleX < 0 ? -1 : 1;
        const newScaleY: number = scaleY < 0 ? -1 : 1;

        const prop: KonvaShapeProp = currentPropRef.current;

        const newWidth: number = Math.round(
          prop.shapeOption.width * scaleX * newScaleX
        );
        const newHeight: number = Math.round(
          prop.shapeOption.height * scaleY * newScaleY
        );

        Object.assign(prop.shapeOption, {
          width: newWidth,
          height: newHeight,
          rotation: node.rotation(),
          scaleX: newScaleX,
          scaleY: newScaleY,
          x: node.x(),
          y: node.y(),
          offsetX: newWidth / 2,
          offsetY: newHeight / 2,
        });

        // Call callback function
        prop.onAppliedProp?.(
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

        let width = shape.width();
        let height = shape.height();

        context.save();
        context.beginPath();
        context.rect(0, 0, width, height);
        context.closePath();
        context.clip();

        if (cropElementRef.current) {
          context.save();

          width = cropElementRef.current.width();
          height = cropElementRef.current.height();

          const m = cropElementRef.current.getAbsoluteTransform().getMatrix();
          context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }

        context.drawImage(img, 0, 0, width, height);
        context.fillStrokeShape(shape);

        if (cropElementRef.current) {
          context.restore();
        }

        context.restore();
      },
      []
    );

    return (
      <Portal selector={"#shapes"} enabled={isEnabled}>
        <Image
          listening={true}
          ref={nodeRef}
          image={undefined}
          onClick={handleClick}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
          sceneFunc={handleScene}
        />
      </Portal>
    );
  }
);
