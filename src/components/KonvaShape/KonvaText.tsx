import { HorizontalAlign, VerticalAlign } from "../../types/Window";
import { KonvaShape, KonvaShapeAPI, KonvaShapeProp } from "./Types";
import { parseHexToRGBAString } from "../../utils/Color";
import { createShapeBox } from "../../utils/Shapes";
import { Html, Portal } from "react-konva-utils";
import { Text } from "react-konva";
import React from "react";
import Konva from "konva";

export const KonvaText = React.memo(
  (prop: KonvaShapeProp): React.JSX.Element => {
    const nodeRef = React.useRef<Konva.Text>(undefined);
    const currentPropRef = React.useRef<KonvaShapeProp>(prop);
    const [isEnabled, setIsEnabled] = React.useState<boolean>(false);

    // Store text
    const textareaRef = React.useRef<HTMLTextAreaElement>(undefined);

    // Apply prop
    const applyProp = React.useCallback((): void => {
      const node: Konva.Text = nodeRef.current;
      if (node) {
        const prop: KonvaShapeProp = currentPropRef.current;
        const shapeOption: KonvaShape = prop.shapeOption;

        // Update offset
        shapeOption.offsetX = shapeOption.width / 2;
        shapeOption.offsetY = shapeOption.height / 2;

        // Update node attrs
        node.setAttrs({
          ...shapeOption,
          draggable: shapeOption.draggable && prop.isSelected,
          visible:
            !textareaRef.current ||
            textareaRef.current.style.visibility === "hidden",
          fill: parseHexToRGBAString(
            shapeOption.fill as string,
            shapeOption.fillOpacity
          ),
          stroke: parseHexToRGBAString(
            shapeOption.stroke as string,
            shapeOption.strokeOpacity
          ),
          fontStyle:
            shapeOption.fontWeight === "bold"
              ? shapeOption.fontStyle === "italic"
                ? "italic bold"
                : "bold"
              : shapeOption.fontStyle,
        });

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
    const getNode = React.useCallback((): Konva.Text => {
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

    const handleClick = React.useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>): void => {
        // Call callback function
        currentPropRef.current.onClick?.(e, shapeAPI);
      },
      []
    );

    const handleDblClick = React.useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>): void => {
        const textArea = textareaRef.current;
        if (!textArea) {
          return;
        }

        const shapeOption: KonvaShape = currentPropRef.current.shapeOption;

        e.target?.visible(false);

        Object.assign(textArea.style, {
          visibility: "visible",
          fontSize: `${shapeOption.fontSize}px`,
          lineHeight: shapeOption.lineHeight.toString(),
          fontFamily: shapeOption.fontFamily,
          fontStyle: shapeOption.fontStyle,
          fontWeight: shapeOption.fontWeight,
          textAlign: shapeOption.align as HorizontalAlign,
          verticalAlign: shapeOption.verticalAlign as VerticalAlign,
          color: shapeOption.fill as string,
          transform: `rotateZ(${shapeOption.rotation}deg)`,
          width: `${shapeOption.width}px`,
          height: `${shapeOption.height}px`,
          left: `${shapeOption.x - shapeOption.offsetX}px`,
          top: `${shapeOption.y - shapeOption.offsetY}px`,
          padding: `${shapeOption.padding}px`,
          filter: `brightness(${(shapeOption.brightness || 0) + 1})`,
        });

        textArea.value = shapeOption.text;

        textArea.focus();
      },
      []
    );

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
        const node: Konva.Text = e.target as Konva.Text;
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
        const node: Konva.Text = e.target as Konva.Text;
        if (node) {
          const shapeOption: KonvaShape = currentPropRef.current.shapeOption;

          const scaleX: number = node.scaleX();
          const scaleY: number = node.scaleY();

          const newScaleX: number = scaleX < 0 ? -1 : 1;
          const newScaleY: number = scaleY < 0 ? -1 : 1;

          const scaleXAbs = scaleX * newScaleX;
          const scaleYAbs = scaleY * newScaleY;

          let newHeight: number = Math.round(
            shapeOption.height * scaleY * newScaleY
          );

          const textArea = textareaRef.current;
          if (textArea) {
            textArea.style.width = `${shapeOption.width}px`;

            // To calculate new height
            textArea.style.height = "auto";

            if (textArea.scrollHeight > newHeight) {
              newHeight = Math.round(textArea.scrollHeight);
            }

            textArea.style.height = `${newHeight}px`;
            textArea.style.top = `${shapeOption.y - newHeight / 2}px`;
          }

          let fontSize: number;

          if (scaleXAbs.toPrecision(5) === scaleYAbs.toPrecision(5)) {
            fontSize = Math.round(shapeOption.fontSize * scaleXAbs);

            if (fontSize < 1) {
              fontSize = 1;
            }
          } else {
            fontSize = shapeOption.fontSize;
          }

          Object.assign(shapeOption, {
            fontSize: fontSize,
            width: Math.round(shapeOption.width * scaleXAbs),
            height: newHeight,
            rotation: node.rotation(),
            scaleX: newScaleX,
            scaleY: newScaleY,
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

    const onBlurHandler = React.useCallback((): void => {
      if (textareaRef.current) {
        textareaRef.current.style.visibility = "hidden";
      }

      // Call callback function
      currentPropRef.current.onAppliedProp?.(shapeAPI, "commit");
    }, []);

    const onInputHandler = React.useCallback(
      (e: React.FormEvent<HTMLTextAreaElement>): void => {
        const textArea = e.currentTarget;
        if (!textArea) {
          return;
        }

        const shapeOption: KonvaShape = currentPropRef.current.shapeOption;

        // Update text
        shapeOption.text = textArea.value;

        // To calculate new height
        textArea.style.height = "auto";

        const newHeight = textArea.scrollHeight;

        if (newHeight >= shapeOption.height) {
          textArea.style.height = `${newHeight}px`;
          textArea.style.top = `${shapeOption.y - newHeight / 2}px`;

          // Update height
          shapeOption.height = newHeight;

          applyProp();
        }
      },
      []
    );

    return (
      <Portal selector={"#shapes"} enabled={isEnabled}>
        <Html>
          <textarea
            ref={textareaRef}
            style={{
              visibility: "hidden",
              display: "block",
              position: "absolute",
              transformOrigin: "center",
              border: "none",
              overflow: "hidden",
              outline: "none",
              background: "none",
              resize: "none",
              filter: "none",
              transform: "none",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              fontStyle: "normal",
              fontWeight: "normal",
              padding: "0px",
              margin: "0px",
              height: "auto",
            }}
            onBlur={onBlurHandler}
            onInput={onInputHandler}
          />
        </Html>

        <Text
          listening={true}
          ref={nodeRef}
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
