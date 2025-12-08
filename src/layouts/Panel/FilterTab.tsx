import { TooltipCheckbox } from "../../components/TooltipCheckbox";
import { SliderInput } from "../../components/SliderInput";
import { useShapesContext } from "../../contexts";
import { useTranslation } from "react-i18next";
import { TabPanel } from "@mui/lab";
import React from "react";
import {
  signedNormalizedMarks,
  signedPercentMarks,
  normalizedMarks,
  percentMarks,
  levelMarks,
} from "../../types/Common";
import {
  HdrEnhancedSelectTwoTone,
  HighQualityTwoTone,
  Brightness6TwoTone,
  ExpandMoreTwoTone,
  ContrastTwoTone,
  BlurOnTwoTone,
  GrainTwoTone,
} from "@mui/icons-material";
import {
  AccordionDetails,
  AccordionSummary,
  Typography,
  Accordion,
  Stack,
} from "@mui/material";

export const FilterTab = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { selectedShape, updateShape } = useShapesContext();

  const updateShapeHandler = React.useMemo(
    () => ({
      changeBrightness: (value: number): void => {
        updateShape(
          {
            brightness: value,
          },
          true,
          true
        );
      },
      changeContrast: (value: number): void => {
        updateShape(
          {
            contrast: value,
          },
          true,
          true
        );
      },
      changeHighQuality: (value: number): void => {
        updateShape(
          {
            pixelSize: value,
          },
          true,
          true
        );
      },
      changeEnhance: (value: number): void => {
        updateShape(
          {
            enhance: value,
          },
          true,
          true
        );
      },
      changeNoise: (value: number): void => {
        updateShape(
          {
            noise: value,
          },
          true,
          true
        );
      },
      changeBlurRadius: (value: number): void => {
        updateShape(
          {
            blurRadius: value,
          },
          true,
          true
        );
      },
      changeGrayscale: (checked: boolean): void => {
        updateShape(
          {
            grayscale: checked,
          },
          true,
          true
        );
      },
      changeInvert: (checked: boolean): void => {
        updateShape(
          {
            invert: checked,
          },
          true,
          true
        );
      },
      changeSepia: (checked: boolean): void => {
        updateShape(
          {
            sepia: checked,
          },
          true,
          true
        );
      },
      changeSolarize: (checked: boolean): void => {
        updateShape(
          {
            solarize: checked,
          },
          true,
          true
        );
      },
    }),
    [updateShape]
  );

  return (
    <TabPanel sx={{ width: "100%", paddingX: 0 }} value={"filter"}>
      {/* General */}
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.filter.children.general.title")}
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
          {/* High Quality/Enhance */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <SliderInput
              icon={<HighQualityTwoTone fontSize={"small"} />}
              title={t(
                "panel.filter.children.general.children.highQuality.title"
              )}
              value={selectedShape.pixelSize}
              min={1}
              max={3}
              marks={levelMarks}
              onChange={updateShapeHandler.changeHighQuality}
            />

            <SliderInput
              icon={<HdrEnhancedSelectTwoTone fontSize={"small"} />}
              title={t("panel.filter.children.general.children.enhance.title")}
              value={selectedShape.enhance}
              min={-1}
              max={1}
              step={0.05}
              marks={signedNormalizedMarks}
              onChange={updateShapeHandler.changeEnhance}
            />
          </Stack>

          {/* Brightness/Contrast */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <SliderInput
              icon={<Brightness6TwoTone fontSize={"small"} />}
              title={t(
                "panel.filter.children.general.children.brightness.title"
              )}
              value={selectedShape.brightness}
              min={-1}
              max={1}
              step={0.05}
              marks={signedNormalizedMarks}
              onChange={updateShapeHandler.changeBrightness}
            />

            <SliderInput
              icon={<ContrastTwoTone fontSize={"small"} />}
              title={t("panel.filter.children.general.children.contrast.title")}
              value={selectedShape.contrast}
              min={-100}
              max={100}
              marks={signedPercentMarks}
              onChange={updateShapeHandler.changeContrast}
            />
          </Stack>

          {/* Noise/Blur */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <SliderInput
              icon={<GrainTwoTone fontSize={"small"} />}
              title={t("panel.filter.children.general.children.noise.title")}
              value={selectedShape.noise}
              max={1}
              step={0.05}
              marks={normalizedMarks}
              onChange={updateShapeHandler.changeNoise}
            />

            <SliderInput
              icon={<BlurOnTwoTone fontSize={"small"} />}
              title={t("panel.filter.children.general.children.blur.title")}
              value={selectedShape.blurRadius}
              max={100}
              marks={percentMarks}
              onChange={updateShapeHandler.changeBlurRadius}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Color */}
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.filter.children.color.title")}
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
          {/* Grayscale/Invert */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <TooltipCheckbox
              label={
                <Typography fontSize={12}>
                  {t("panel.filter.children.color.children.grayscale.title")}
                </Typography>
              }
              title={t("panel.filter.children.color.children.grayscale.title")}
              checked={selectedShape.grayscale}
              onChange={updateShapeHandler.changeGrayscale}
            />

            <TooltipCheckbox
              label={
                <Typography fontSize={12}>
                  {t("panel.filter.children.color.children.invert.title")}
                </Typography>
              }
              title={t("panel.filter.children.color.children.invert.title")}
              checked={selectedShape.invert}
              onChange={updateShapeHandler.changeInvert}
            />
          </Stack>

          {/* Sepia/Solarize */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <TooltipCheckbox
              label={
                <Typography fontSize={12}>
                  {t("panel.filter.children.color.children.sepia.title")}
                </Typography>
              }
              title={t("panel.filter.children.color.children.sepia.title")}
              checked={selectedShape.sepia}
              onChange={updateShapeHandler.changeSepia}
            />

            <TooltipCheckbox
              label={
                <Typography fontSize={12}>
                  {t("panel.filter.children.color.children.solarize.title")}
                </Typography>
              }
              title={t("panel.filter.children.color.children.solarize.title")}
              checked={selectedShape.solarize}
              onChange={updateShapeHandler.changeSolarize}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>
    </TabPanel>
  );
});
