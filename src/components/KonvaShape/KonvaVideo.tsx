import { KonvaShape, KonvaShapeAPI, KonvaShapeProp } from "./Types";
import { parseHexToRGBAString } from "../../utils/Color";
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

    // Store animation
    const animRef = React.useRef<Konva.Animation>(undefined);

    // Apply prop
    const applyProp = React.useCallback((): void => {
      const node: Konva.Image = nodeRef.current;
      if (node) {
        const prop: KonvaShapeProp = currentPropRef.current;
        const shapeOption: KonvaShape = prop.shapeOption;

        // update offset
        shapeOption.offsetX = shapeOption.width / 2;
        shapeOption.offsetY = shapeOption.height / 2;

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
        });

        // Update video attrs
        const image: HTMLVideoElement = shapeOption.image as HTMLVideoElement;
        if (image) {
          image.loop = shapeOption.loop ? true : false;

          if (shapeOption.speed !== undefined) {
            image.playbackRate = shapeOption.inverse
              ? -shapeOption.speed
              : shapeOption.speed;
          }

          if (shapeOption.volume !== undefined) {
            image.volume = shapeOption.volume;
          }

          if (shapeOption.isPlay) {
            image.play();
          } else {
            image.pause();
          }
        }

        // Update shape box
        shapeOption.box = createShapeBox(node);
      }

      // Call callback function
      prop.onAppliedProp?.(shapeAPI, "apply-prop");
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

      applyProp();

      // Call callback function
      prop.onMounted?.(prop.shapeOption.id, shapeAPI);

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

    return (
      <Portal selector={"#shapes"} enabled={isEnabled}>
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
          onTransformEnd={handleTransformEnd}
        />
      </Portal>
    );
  }
);
