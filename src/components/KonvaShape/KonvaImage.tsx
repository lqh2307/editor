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

    const updateCropElement = () => {
      if (!cropElementRef.current || !cropImageRef.current || !nodeRef.current) {
        return;
      }

      const options = nodeRef.current
        .getAbsoluteTransform()
        .copy()
        .invert()
        .multiply(cropImageRef.current.getAbsoluteTransform())
        .decompose();

      cropElementRef.current.setAttrs(options);
    };

    const startCrop = () => {
      const node: Konva.Image = nodeRef.current;
      if (cropImageRef.current || !node) {
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

      const options = node
        .getAbsoluteTransform()
        .copy()
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

      cropImageRef.current.on("dragmove transform", updateCropElement);

      const layer = node.getLayer();

      layer.add(cropImageRef.current);

      const cropper: Konva.Transformer = layer.findOne("#cropper") as Konva.Transformer;
      if (cropper) {
        cropper.nodes([cropImageRef.current]);

        cropper.moveToTop();
      }
    };

    const endCrop = (restore?: boolean) => {
      if (cropImageRef.current && nodeRef.current) {
        (nodeRef.current.getLayer().findOne("#cropper") as Konva.Transformer)?.nodes([]);

        cropImageRef.current.remove();
        cropImageRef.current = null;
      }

      if (restore && cropElementRef.current) {
        cropElementRef.current.remove();
        cropElementRef.current = null;
      }
    };

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
      if (!node) {
        return;
      }

      const prop: KonvaShapeProp = currentPropRef.current;
      const shapeOption: KonvaShape = prop.shapeOption;

      // Update node attrs
      node.setAttrs({
        ...shapeOption,
        draggable: prop.isSelected,
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
      // if (shapeOption.width || shapeOption.height) {
      //   node.cache();
      // }

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

        updateCropElement()

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
      },
      []
    );

    const handleTransform = React.useCallback(
      (): void => {
        updateCropElement();
      },
      []
    );

    const handleTransformEnd = React.useCallback(
      (e: Konva.KonvaEventObject<Event>): void => {
        const node: Konva.Image = e.target as Konva.Image;
        if (!node) {
          return;
        }

        const prop: KonvaShapeProp = currentPropRef.current;

        Object.assign(prop.shapeOption, {
          rotation: node.rotation(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          x: node.x(),
          y: node.y(),
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
        context.clip();

        if (cropElementRef.current) {
          context.save();

          const m = cropElementRef.current.getAbsoluteTransform().getMatrix();
          context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

          context.drawImage(img, 0, 0, cropElementRef.current.width(), cropElementRef.current.height());

          context.restore();
        } else {
          context.drawImage(img, 0, 0, width, height);
        }

        context.save();
        context.shadowColor = context.shadowColor;
        context.shadowBlur = context.shadowBlur;
        context.shadowOffsetX = context.shadowOffsetX;
        context.shadowOffsetY = context.shadowOffsetY;

        context.beginPath();
        context.rect(0, 0, width, height);
        context.fillStrokeShape(shape);
        context.restore();

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
          onTransform={handleTransform}
          onTransformEnd={handleTransformEnd}
          sceneFunc={handleScene}
        />
      </Portal>
    );
  }
);
