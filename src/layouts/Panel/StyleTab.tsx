import { SelectInput, SelectInputOption } from "../../components/SelectInput";
import translation from "../../locales/english/translation.json";
import { TooltipButton } from "../../components/TooltipButton";
import { TooltipSwitch } from "../../components/TooltipSwitch";
import { NumberInput } from "../../components/NumberInput";
import { SliderInput } from "../../components/SliderInput";
import { ColorInput } from "../../components/ColorInput";
import { LineCap, LineJoin } from "konva/lib/Shape";
import { useShapesContext } from "../../contexts";
import { useTranslation } from "react-i18next";
import { fixNumber } from "../../utils/Number";
import { TabPanel } from "@mui/lab";
import React from "react";
import {
  IncompleteCircleTwoTone,
  FormatColorFillTwoTone,
  RoundedCornerTwoTone,
  RotateRightTwoTone,
  BorderColorTwoTone,
  ExpandMoreTwoTone,
  LineWeightTwoTone,
  CropRotateTwoTone,
  PentagonTwoTone,
  RestoreTwoTone,
  OpacityTwoTone,
  BlurOnTwoTone,
  StarTwoTone,
} from "@mui/icons-material";
import {
  AccordionDetails,
  AccordionSummary,
  ButtonGroup,
  Typography,
  Accordion,
  Stack,
} from "@mui/material";
import {
  signedAngleDegreeMarks,
  polygonPointMarks,
  angleDegreeMarks,
  normalizedMarks,
  percentMarks,
} from "../../types/Common";

export const PanelStyleTab = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { selectedShape, updateShape, shapeRefs } = useShapesContext();

  const updateShapeHandler = React.useMemo(
    () => ({
      changeFillColor: (value: string): void => {
        updateShape(
          {
            fill: value,
          },
          true,
          true
        );
      },
      changeShadowColor: (value: string): void => {
        updateShape(
          {
            shadowColor: value,
          },
          true,
          true
        );
      },
      changeStrokeColor: (value: string): void => {
        updateShape(
          {
            stroke: value,
          },
          true,
          true
        );
      },
      changeFillOpacity: (value: number): void => {
        updateShape(
          {
            fillOpacity: value,
          },
          true,
          true
        );
      },
      changeShadowOpacity: (value: number): void => {
        updateShape(
          {
            shadowOpacity: value,
          },
          true,
          true
        );
      },
      changeStrokeOpacity: (value: number): void => {
        updateShape(
          {
            strokeOpacity: value,
          },
          true,
          true
        );
      },
      changeSides: (value: number): void => {
        updateShape(
          {
            sides: value,
          },
          true,
          true
        );
      },
      changeNumPoints: (value: number): void => {
        updateShape(
          {
            numPoints: value,
          },
          true,
          true
        );
      },
      changeRadius: (value: string): void => {
        updateShape(
          {
            radius: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeAngle: (value: number): void => {
        updateShape(
          {
            angle: value,
          },
          true,
          true
        );
      },
      changeInnerRadius: (value: string): void => {
        updateShape(
          {
            innerRadius: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeOuterRadius: (value: string): void => {
        updateShape(
          {
            outerRadius: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeRadiusX: (value: string): void => {
        updateShape(
          {
            radiusX: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeRadiusY: (value: string): void => {
        updateShape(
          {
            radiusY: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeWidth: (value: string): void => {
        updateShape(
          {
            width: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeHeight: (value: string): void => {
        updateShape(
          {
            height: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeScaleX: (value: string): void => {
        updateShape(
          {
            scaleX: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeScaleY: (value: string): void => {
        updateShape(
          {
            scaleY: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeSkewX: (value: string): void => {
        updateShape(
          {
            skewX: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeSkewY: (value: string): void => {
        updateShape(
          {
            skewY: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeCornerRadius: (value: string): void => {
        updateShape(
          {
            cornerRadius: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeRotation: (value: number): void => {
        updateShape(
          {
            rotation: value,
          },
          true,
          true
        );
      },
      changeOpacity: (value: number): void => {
        updateShape(
          {
            opacity: value,
          },
          true,
          true
        );
      },
      changeClockwise: (checked: boolean): void => {
        updateShape(
          {
            clockwise: checked,
          },
          true,
          true
        );
      },
      changeShadowOffsetX: (value: string): void => {
        updateShape(
          {
            shadowOffsetX: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeShadowOffsetY: (value: string): void => {
        updateShape(
          {
            shadowOffsetY: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeShadowBlur: (value: number): void => {
        updateShape(
          {
            shadowBlur: value,
          },
          true,
          true
        );
      },
      changeStrokeWidth: (value: number): void => {
        updateShape(
          {
            strokeWidth: value,
          },
          true,
          true
        );
      },
      changeLineCap: (value: string): void => {
        updateShape(
          {
            lineCap: value as LineCap,
          },
          true,
          true
        );
      },
      changeLineJoin: (value: string): void => {
        updateShape(
          {
            lineJoin: value as LineJoin,
          },
          true,
          true
        );
      },
      changePointerWidth: (value: string): void => {
        updateShape(
          {
            pointerWidth: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changePointerLength: (value: string): void => {
        updateShape(
          {
            pointerLength: fixNumber(value, true),
          },
          true,
          true
        );
      },
      changeFillEnabled: (checked: boolean): void => {
        updateShape(
          {
            fillEnabled: checked,
          },
          true,
          true
        );
      },
      changeShadowEnabled: (checked: boolean): void => {
        updateShape(
          {
            shadowEnabled: checked,
          },
          true,
          true
        );
      },
      changeStrokeEnabled: (checked: boolean): void => {
        updateShape(
          {
            strokeEnabled: checked,
          },
          true,
          true
        );
      },
    }),
    [updateShape]
  );

  const cropHandler = React.useCallback(
    (value: string): void => {
      if (selectedShape.type === "image") {
        if (value) {
          shapeRefs[selectedShape.id]?.startCrop();
        } else {
          shapeRefs[selectedShape.id]?.endCrop(true);
        }
      }
    },
    [selectedShape, shapeRefs]
  );

  const data = React.useMemo<Record<string, SelectInputOption[]>>(
    () => ({
      lineCaps: Object.keys(
        translation.panel.style.children.stroke.children.lineCap.content
      ).map((item) => ({
        title: t(
          `panel.style.children.stroke.children.lineCap.content.${item}`
        ),
        value: item,
      })),
      lineJoins: Object.keys(
        translation.panel.style.children.stroke.children.lineJoin.content
      ).map((item) => ({
        title: t(
          `panel.style.children.stroke.children.lineJoin.content.${item}`
        ),
        value: item,
      })),
    }),
    [t]
  );

  return (
    <TabPanel sx={{ width: "100%", paddingX: 0 }} value={"style"}>
      {/* General */}
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.style.children.general.title")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          {/* Sides */}
          <SliderInput
            display={selectedShape.type === "convex-polygon" ? "flex" : "none"}
            icon={<PentagonTwoTone fontSize={"small"} />}
            title={t("panel.style.children.general.children.sides.title")}
            value={selectedShape.sides}
            min={3}
            max={6}
            marks={polygonPointMarks}
            onChange={updateShapeHandler.changeSides}
          />

          {/* Num Points */}
          <SliderInput
            display={selectedShape.type === "concave-polygon" ? "flex" : "none"}
            icon={<StarTwoTone fontSize={"small"} />}
            title={t("panel.style.children.general.children.numPoints.title")}
            value={selectedShape.numPoints}
            min={3}
            max={6}
            marks={polygonPointMarks}
            onChange={updateShapeHandler.changeNumPoints}
          />

          {/* Radius */}
          <NumberInput
            display={
              selectedShape.type === "circle" ||
              selectedShape.type === "convex-polygon" ||
              selectedShape.type === "wedge"
                ? "flex"
                : "none"
            }
            label={t("panel.style.children.general.children.radius.title")}
            value={selectedShape.radius}
            onChange={updateShapeHandler.changeRadius}
            max={32768}
          />

          {/* Angle */}
          <SliderInput
            display={selectedShape.type === "wedge" ? "flex" : "none"}
            icon={<IncompleteCircleTwoTone fontSize={"small"} />}
            title={t("panel.style.children.general.children.angle.title")}
            value={selectedShape.angle}
            max={360}
            marks={angleDegreeMarks}
            onChange={updateShapeHandler.changeAngle}
          />

          {/* Inner Radius/Outer Radius */}
          <Stack
            sx={{
              display:
                selectedShape.type === "concave-polygon" ||
                selectedShape.type === "ring"
                  ? "flex"
                  : "none",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <NumberInput
              label={t(
                "panel.style.children.general.children.innerRadius.title"
              )}
              value={selectedShape.innerRadius}
              onChange={updateShapeHandler.changeInnerRadius}
              max={32768}
            />

            <NumberInput
              label={t(
                "panel.style.children.general.children.outerRadius.title"
              )}
              value={selectedShape.outerRadius}
              onChange={updateShapeHandler.changeOuterRadius}
              max={32768}
            />
          </Stack>

          {/* Radius X/Radius Y */}
          <Stack
            sx={{
              display: selectedShape.type === "ellipse" ? "flex" : "none",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <NumberInput
              label={t("panel.style.children.general.children.radiusX.title")}
              value={selectedShape.radiusX}
              onChange={updateShapeHandler.changeRadiusX}
              max={32768}
            />

            <NumberInput
              label={t("panel.style.children.general.children.radiusY.title")}
              value={selectedShape.radiusY}
              onChange={updateShapeHandler.changeRadiusY}
              max={32768}
            />
          </Stack>

          {/* Width/Height */}
          <Stack
            sx={{
              display:
                selectedShape.type === "text" ||
                selectedShape.type === "rectangle" ||
                selectedShape.type === "image" ||
                selectedShape.type === "video"
                  ? "flex"
                  : "none",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <NumberInput
              label={t("panel.style.children.general.children.width.title")}
              value={selectedShape.width}
              onChange={updateShapeHandler.changeWidth}
            />

            <NumberInput
              label={t("panel.style.children.general.children.height.title")}
              value={selectedShape.height}
              onChange={updateShapeHandler.changeHeight}
            />
          </Stack>

          {/* ScaleX/ScaleY */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <NumberInput
              label={t("panel.style.children.general.children.scaleX.title")}
              value={selectedShape.scaleX}
              onChange={updateShapeHandler.changeScaleX}
              min={0.01}
              step={0.01}
            />

            <NumberInput
              label={t("panel.style.children.general.children.scaleY.title")}
              value={selectedShape.scaleY}
              onChange={updateShapeHandler.changeScaleY}
              min={0.01}
              step={0.01}
            />
          </Stack>

          {/* SkewX/SkewY */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <NumberInput
              label={t("panel.style.children.general.children.skewX.title")}
              value={selectedShape.skewX}
              onChange={updateShapeHandler.changeSkewX}
              min={0}
              step={0.01}
            />

            <NumberInput
              label={t("panel.style.children.general.children.skewY.title")}
              value={selectedShape.skewY}
              onChange={updateShapeHandler.changeSkewY}
              min={0}
              step={0.01}
            />
          </Stack>

          {/* Corner Radius */}
          <NumberInput
            display={
              selectedShape.type === "rectangle" ||
              selectedShape.type === "image"
                ? "flex"
                : "none"
            }
            icon={<RoundedCornerTwoTone fontSize={"small"} />}
            title={t(
              "panel.style.children.general.children.cornerRadius.title"
            )}
            value={selectedShape.cornerRadius}
            onChange={updateShapeHandler.changeCornerRadius}
          />

          {/* Clockwise */}
          <TooltipSwitch
            display={selectedShape.type === "wedge" ? "flex" : "none"}
            label={
              <Typography fontSize={12}>
                {t("panel.style.children.general.children.clockwise.title")}
              </Typography>
            }
            title={t("panel.style.children.general.children.clockwise.title")}
            checked={selectedShape.clockwise}
            onChange={updateShapeHandler.changeClockwise}
          />

          {/* Rotation */}
          <SliderInput
            icon={<RotateRightTwoTone fontSize={"small"} />}
            title={t("panel.style.children.general.children.rotation.title")}
            value={selectedShape.rotation}
            min={-180}
            max={180}
            marks={signedAngleDegreeMarks}
            onChange={updateShapeHandler.changeRotation}
          />

          {/* Opacity */}
          <SliderInput
            icon={<OpacityTwoTone fontSize={"small"} />}
            title={t("panel.style.children.general.children.opacity.title")}
            value={selectedShape.opacity}
            max={1}
            step={0.05}
            marks={normalizedMarks}
            onChange={updateShapeHandler.changeOpacity}
          />
        </AccordionDetails>
      </Accordion>

      {/* Fill */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.style.children.fill.title")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          {/* Enabled */}
          <TooltipSwitch
            label={
              <Typography fontSize={12}>
                {t("panel.style.children.fill.children.enabled.title")}
              </Typography>
            }
            title={t("panel.style.children.fill.children.enabled.title")}
            checked={selectedShape.fillEnabled}
            onChange={updateShapeHandler.changeFillEnabled}
          />

          {/* Color/Opacity */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <ColorInput
              icon={<FormatColorFillTwoTone fontSize={"small"} />}
              title={t("panel.style.children.fill.children.color.title")}
              value={selectedShape.fill}
              onChange={updateShapeHandler.changeFillColor}
            />

            <SliderInput
              icon={<OpacityTwoTone fontSize={"small"} />}
              title={t("panel.style.children.fill.children.opacity.title")}
              value={selectedShape.fillOpacity}
              disabled={!selectedShape.fillEnabled}
              max={1}
              step={0.05}
              marks={normalizedMarks}
              onChange={updateShapeHandler.changeFillOpacity}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Stroke */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.style.children.stroke.title")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          {/* Enabled */}
          <TooltipSwitch
            label={
              <Typography fontSize={12}>
                {t("panel.style.children.stroke.children.enabled.title")}
              </Typography>
            }
            title={t("panel.style.children.stroke.children.enabled.title")}
            checked={selectedShape.strokeEnabled}
            onChange={updateShapeHandler.changeStrokeEnabled}
          />

          {/* Width */}
          <SliderInput
            icon={<LineWeightTwoTone fontSize={"small"} />}
            title={t("panel.style.children.stroke.children.width.title")}
            value={selectedShape.strokeWidth}
            disabled={!selectedShape.strokeEnabled}
            max={100}
            marks={percentMarks}
            onChange={updateShapeHandler.changeStrokeWidth}
          />

          {/* Color/Opacity */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <ColorInput
              icon={<BorderColorTwoTone fontSize={"small"} />}
              title={t("panel.style.children.stroke.children.color.title")}
              value={selectedShape.stroke}
              disabled={!selectedShape.strokeEnabled}
              onChange={updateShapeHandler.changeStrokeColor}
            />

            <SliderInput
              icon={<OpacityTwoTone fontSize={"small"} />}
              title={t("panel.style.children.stroke.children.opacity.title")}
              disabled={!selectedShape.strokeEnabled}
              value={selectedShape.strokeOpacity}
              max={1}
              step={0.05}
              marks={normalizedMarks}
              onChange={updateShapeHandler.changeStrokeOpacity}
            />
          </Stack>

          {/* Line Cap/Line Join */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <SelectInput
              label={t("panel.style.children.stroke.children.lineCap.title")}
              value={selectedShape.lineCap}
              onChange={updateShapeHandler.changeLineCap}
              disabled={!selectedShape.strokeEnabled}
              options={data.lineCaps}
            />

            <SelectInput
              label={t("panel.style.children.stroke.children.lineJoin.title")}
              value={selectedShape.lineJoin}
              onChange={updateShapeHandler.changeLineJoin}
              disabled={!selectedShape.strokeEnabled}
              options={data.lineJoins}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Pointer */}
      <Accordion
        sx={{
          display: selectedShape.type === "arrow" ? "block" : "none",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.style.children.pointer.title")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          {/* Width/Length */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <NumberInput
              label={t("panel.style.children.pointer.children.width.title")}
              value={selectedShape.pointerWidth}
              onChange={updateShapeHandler.changePointerWidth}
            />

            <NumberInput
              label={t("panel.style.children.pointer.children.length.title")}
              value={selectedShape.pointerLength}
              onChange={updateShapeHandler.changePointerLength}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Shadow */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.style.children.shadow.title")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          {/* Enabled */}
          <TooltipSwitch
            label={
              <Typography fontSize={12}>
                {t("panel.style.children.shadow.children.enabled.title")}
              </Typography>
            }
            title={t("panel.style.children.shadow.children.enabled.title")}
            checked={selectedShape.shadowEnabled}
            onChange={updateShapeHandler.changeShadowEnabled}
          />

          {/* Horizontal/Vertical */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <NumberInput
              label={t("panel.style.children.shadow.children.horizontal.title")}
              value={selectedShape.shadowOffsetX}
              disabled={!selectedShape.shadowEnabled}
              onChange={updateShapeHandler.changeShadowOffsetX}
            />

            <NumberInput
              label={t("panel.style.children.shadow.children.vertical.title")}
              value={selectedShape.shadowOffsetY}
              disabled={!selectedShape.shadowEnabled}
              onChange={updateShapeHandler.changeShadowOffsetY}
            />
          </Stack>

          {/* Color/Opacity */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <ColorInput
              icon={<FormatColorFillTwoTone fontSize={"small"} />}
              title={t("panel.style.children.shadow.children.color.title")}
              value={selectedShape.shadowColor}
              onChange={updateShapeHandler.changeShadowColor}
              disabled={!selectedShape.shadowEnabled}
            />

            <SliderInput
              icon={<OpacityTwoTone fontSize={"small"} />}
              title={t("panel.style.children.shadow.children.opacity.title")}
              value={selectedShape.shadowOpacity}
              disabled={!selectedShape.shadowEnabled}
              max={1}
              step={0.05}
              marks={normalizedMarks}
              onChange={updateShapeHandler.changeShadowOpacity}
            />
          </Stack>

          {/* Blur */}
          <SliderInput
            icon={<BlurOnTwoTone fontSize={"small"} />}
            title={t("panel.style.children.shadow.children.blur.title")}
            value={selectedShape.shadowBlur}
            disabled={!selectedShape.shadowEnabled}
            max={100}
            marks={percentMarks}
            onChange={updateShapeHandler.changeShadowBlur}
          />
        </AccordionDetails>
      </Accordion>

      {/* Crop */}
      <Accordion
        sx={{
          display: selectedShape.type === "image" ? "block" : "none",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.style.children.crop.title")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Crop/Restore */}
          <ButtonGroup variant={"outlined"} size={"small"}>
            <TooltipButton
              icon={<CropRotateTwoTone fontSize={"small"} />}
              title={t("panel.style.children.crop.children.crop.title")}
              value={"true"}
              onClick={cropHandler}
            />

            <TooltipButton
              icon={<RestoreTwoTone fontSize={"small"} />}
              title={t("panel.style.children.crop.children.restore.title")}
              value={""}
              onClick={cropHandler}
            />
          </ButtonGroup>
        </AccordionDetails>
      </Accordion>
    </TabPanel>
  );
});
