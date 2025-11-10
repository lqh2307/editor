import { parseHexToRGBAString } from "../../utils/Color";
import { KonvaShape, KonvaShapeProp } from "./Types";
import { createShapeBox } from "../../utils/Shapes";
import { Portal } from "react-konva-utils";
import { Image } from "react-konva";
import Konva from "konva";
import React from "react";

export const KonvaVideo = React.memo(
  (prop: KonvaShapeProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Image>(undefined);
    const currentPropRef = React.useRef<KonvaShapeProp>(prop);
    const [isEnabled, setIsEnabled] = React.useState<boolean>(false);
    const animRef = React.useRef<Konva.Animation>(undefined);

    React.useEffect(() => {
      currentPropRef.current = prop;

      applyProp();

      // Call callback function
      prop.onMounted?.(prop.shapeOption.id, {
        updateProp,
        updateShape,
        getNode,
        getShape,
      });

      return () => {
        // Call callback function
        prop.onUnMounted?.(prop.shapeOption.id);
      };
    }, [prop]);

    // Create animation
    React.useEffect(() => {
      if (nodeRef.current) {
        animRef.current = new Konva.Animation(
          () => {},
          nodeRef.current.getLayer()
        );

        animRef.current.start();
      }

      return () => {
        animRef.current?.stop();

        animRef.current = undefined;
      };
    }, []);

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
      });

      // Update video attrs
      const image: HTMLVideoElement = prop.shapeOption
        .image as HTMLVideoElement;
      if (image) {
        image.loop = prop.shapeOption.loop ? true : false;

        if (prop.shapeOption.speed !== undefined) {
          image.playbackRate = prop.shapeOption.inverse
            ? -prop.shapeOption.speed
            : prop.shapeOption.speed;
        }

        if (prop.shapeOption.volume !== undefined) {
          image.volume = prop.shapeOption.volume;
        }

        if (prop.shapeOption.isPlay) {
          image.play();
        } else {
          image.pause();
        }
      }

      // Update shape box
      prop.shapeOption.box = createShapeBox(node);

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
        />
      </Portal>
    );
  }
);
