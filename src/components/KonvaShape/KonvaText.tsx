import { HorizontalAlign, VerticalAlign } from "../../types/Window";
import { parseHexToRGBAString } from "../../utils/Color";
import { KonvaShape, KonvaShapeProp } from "./Types";
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

    // Apply prop
    const applyProp = React.useCallback((): void => {
      const node: Konva.Text = nodeRef.current;
      if (!node) {
        return;
      }

      const prop: KonvaShapeProp = currentPropRef.current;

      // Update node attrs
      node.setAttrs({
        ...prop.shapeOption,
        draggable: prop.isSelected,
        visible:
          !textareaRef.current ||
          textareaRef.current.style.visibility === "hidden",
        fill: parseHexToRGBAString(
          prop.shapeOption.fill as string,
          prop.shapeOption.fillOpacity
        ),
        stroke: parseHexToRGBAString(
          prop.shapeOption.stroke as string,
          prop.shapeOption.strokeOpacity
        ),
        fontStyle:
          prop.shapeOption.fontWeight === "bold"
            ? prop.shapeOption.fontStyle === "italic"
              ? "italic bold"
              : "bold"
            : prop.shapeOption.fontStyle,
      });

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
    const getNode = React.useCallback((): Konva.Text => {
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
        const node: Konva.Text = e.target as Konva.Text;
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

        const node: Konva.Text = e.target as Konva.Text;
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
        const node: Konva.Text = e.target as Konva.Text;
        if (!node) {
          return;
        }

        const scaleX: number = node.scaleX();
        const scaleY: number = node.scaleY();

        const newScaleX: number = scaleX < 0 ? -1 : 1;
        const newScaleY: number = scaleY < 0 ? -1 : 1;

        const scaleXAbs = scaleX * newScaleX;
        const scaleYAbs = scaleY * newScaleY;

        const prop: KonvaShapeProp = currentPropRef.current;

        let newHeight: number = Math.round(
          prop.shapeOption.height * scaleY * newScaleY
        );

        const textArea = textareaRef.current;
        if (textArea) {
          textArea.style.width = `${prop.shapeOption.width}px`;

          // To calculate new height
          textArea.style.height = "auto";

          if (textArea.scrollHeight > newHeight) {
            newHeight = Math.round(textArea.scrollHeight);
          }

          textArea.style.height = `${newHeight}px`;
        }

        let fontSize: number;

        if (scaleXAbs.toPrecision(5) === scaleYAbs.toPrecision(5)) {
          fontSize = Math.round(prop.shapeOption.fontSize * scaleXAbs);

          if (fontSize < 1) {
            fontSize = 1;
          }
        } else {
          fontSize = prop.shapeOption.fontSize;
        }

        Object.assign(prop.shapeOption, {
          fontSize: fontSize,
          width: Math.round(prop.shapeOption.width * scaleXAbs),
          height: newHeight,
          rotation: node.rotation(),
          scaleX: newScaleX,
          scaleY: newScaleY,
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

    const handleDblClick = React.useCallback(
      (e: Konva.KonvaEventObject<MouseEvent>): void => {
        const textArea = textareaRef.current;
        if (!textArea) {
          return;
        }

        e.target?.visible(false);

        const prop: KonvaShapeProp = currentPropRef.current;

        Object.assign(textArea.style, {
          visibility: "visible",
          fontSize: `${prop.shapeOption.fontSize}px`,
          lineHeight: prop.shapeOption.lineHeight.toString(),
          fontFamily: prop.shapeOption.fontFamily,
          fontStyle: prop.shapeOption.fontStyle,
          fontWeight: prop.shapeOption.fontWeight,
          textAlign: prop.shapeOption.align as HorizontalAlign,
          verticalAlign: prop.shapeOption.verticalAlign as VerticalAlign,
          color: prop.shapeOption.fill as string,
          transform: `rotateZ(${prop.shapeOption.rotation}deg)`,
          width: `${prop.shapeOption.width}px`,
          height: `${prop.shapeOption.height}px`,
          left: `${prop.shapeOption.x}px`,
          top: `${prop.shapeOption.y}px`,
          padding: `${prop.shapeOption.padding}px`,
          filter: `brightness(${(prop.shapeOption.brightness || 0) + 1})`,
        });

        textArea.value = prop.shapeOption.text;

        textArea.focus();
      },
      []
    );

    const onBlurHandler = React.useCallback((): void => {
      if (textareaRef.current) {
        textareaRef.current.style.visibility = "hidden";
      }

      // Call callback function
      currentPropRef.current.onAppliedProp?.(
        {
          updateProp,
          updateShape,
          getNode,
          getShape,
        },
        "commit"
      );
    }, []);

    const onInputHandler = React.useCallback(
      (e: React.FormEvent<HTMLTextAreaElement>): void => {
        const textArea = e.currentTarget;
        if (!textArea) {
          return;
        }

        const prop: KonvaShapeProp = currentPropRef.current;

        // Update text
        prop.shapeOption.text = textArea.value;

        // To calculate new height
        textArea.style.height = "auto";

        const newHeight = textArea.scrollHeight;

        if (newHeight >= prop.shapeOption.height) {
          textArea.style.height = `${newHeight}px`;

          // Update height
          prop.shapeOption.height = newHeight;

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
              transformOrigin: "left top",
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
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
          onDblClick={handleDblClick}
        />
      </Portal>
    );
  }
);
