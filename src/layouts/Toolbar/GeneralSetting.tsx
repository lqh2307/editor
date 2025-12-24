import { SelectInput, SelectInputOption } from "../../components/SelectInput";
import { TooltipCheckbox } from "../../components/TooltipCheckbox";
import { useShapesContext, useStageContext } from "../../contexts";
import translation from "../../locales/english/translation.json";
import { TooltipButton } from "../../components/TooltipButton";
import { NumberInput } from "../../components/NumberInput";
import { BasicDialog } from "../../components/BasicDialog";
import { useTranslation } from "react-i18next";
import { fixNumber } from "../../utils/Number";
import React from "react";
import {
  AccordionDetails,
  AccordionSummary,
  ButtonGroup,
  Typography,
  Accordion,
  Stack,
  Box,
} from "@mui/material";
import {
  ExpandMoreTwoTone,
  SettingsTwoTone,
  CloseTwoTone,
} from "@mui/icons-material";

export const ToolbarGeneralSetting = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const {
    language,
    guideLinesThreshold,
    guideLinesStick,
    stageMinWidth,
    stageRatio,
    setLanguage,
    setGuideLinesThreshold,
    setGuideLinesStick,
    stageWidth,
    stageHeight,
    stageZoomMax,
    stageZoomMin,
    stageZoomStep,
    setStageZoom,
    setStageRatio,
    expandStage,
  } = useStageContext();

  const { maxHistory, setMaxHistory } = useShapesContext();

  // Store is setting open
  const [isSettingOpen, setIsSettingOpen] = React.useState<boolean>(false);

  const changeLanguage = React.useCallback(
    (value: string): void => {
      setLanguage(value);
    },
    [setLanguage]
  );

  const changeMaxHistory = React.useCallback(
    (value: string): void => {
      setMaxHistory(fixNumber(value, false));
    },
    [setMaxHistory]
  );

  const changeGuideLinesThreshold = React.useCallback(
    (value: string): void => {
      setGuideLinesThreshold(fixNumber(value, false));
    },
    [setGuideLinesThreshold]
  );

  const changeGuideLinesStick = React.useCallback(
    (checked: boolean): void => {
      setGuideLinesStick(checked);
    },
    [setGuideLinesStick]
  );

  const settingHandler = React.useMemo(() => {
    return {
      open: (): void => {
        setIsSettingOpen(true);
      },
      close: (): void => {
        setIsSettingOpen(false);
      },
      onClose: (_: any, reason: "backdropClick" | "escapeKeyDown"): void => {
        if (reason === "backdropClick") {
          return;
        }

        setIsSettingOpen(false);
      },
    };
  }, []);

  const changeStageZoomHandler = React.useMemo(() => {
    return {
      min: (value: string): void => {
        setStageZoom(fixNumber(value, true, 0.01), "min");
      },
      max: (value: string): void => {
        setStageZoom(fixNumber(value, true, 1), "max");
      },
      step: (value: string): void => {
        setStageZoom(fixNumber(value, true, 0.01), "step");
      },
    };
  }, [setStageZoom]);

  const changeStageRatio = React.useCallback(
    (value: string): void => {
      setStageRatio(fixNumber(value, true, 0.5));
    },
    [setStageRatio]
  );

  const languages: SelectInputOption[] = React.useMemo<SelectInputOption[]>(
    () =>
      Object.keys(
        translation.toolBar.setting.children.language.children.language.content
      ).map((item) => ({
        title: t(
          `toolBar.setting.children.language.children.language.content.${item}`
        ),
        value: item,
      })),
    [t]
  );

  const changeStageSizeHandler = React.useMemo(() => {
    return {
      width: (value: string): void => {
        const width: number = fixNumber(value, true);

        if (width > stageMinWidth) {
          expandStage(width, false);
        }
      },
      height: (value: string): void => {
        const height: number = fixNumber(value, true);

        if (height > stageMinWidth / stageRatio) {
          expandStage(height, true);
        }
      },
    };
  }, [stageMinWidth, stageRatio, expandStage]);

  const dialogTitle: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {t("toolBar.setting.title")}

          <TooltipButton
            onClick={settingHandler.close}
            icon={<CloseTwoTone fontSize="small" />}
            color={"error"}
            title={t("toolBar.setting.common.button.close")}
          />
        </Box>
      );
    }, [t]);

  const dialogContent: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <>
          {/* Language (Language) */}
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
              <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                {t("toolBar.setting.children.language.title")}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <SelectInput
                label={t(
                  "toolBar.setting.children.language.children.language.title"
                )}
                value={language}
                onChange={changeLanguage}
                options={languages}
              />
            </AccordionDetails>
          </Accordion>

          {/* History (Max) */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
              <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                {t("toolBar.setting.children.history.title")}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <NumberInput
                label={t("toolBar.setting.children.history.children.max.title")}
                max={50}
                value={maxHistory}
                onChange={changeMaxHistory}
              />
            </AccordionDetails>
          </Accordion>

          {/* Guide Lines (Threshold/Auto Stick) */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
              <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                {t("toolBar.setting.children.guideLines.title")}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Stack
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <NumberInput
                  label={t(
                    "toolBar.setting.children.guideLines.children.threshold.title"
                  )}
                  min={10}
                  max={25}
                  value={guideLinesThreshold}
                  onChange={changeGuideLinesThreshold}
                />

                <TooltipCheckbox
                  label={
                    <Typography fontSize={12}>
                      {t(
                        "toolBar.setting.children.guideLines.children.guideLinesStick.title"
                      )}
                    </Typography>
                  }
                  title={t(
                    "toolBar.setting.children.guideLines.children.guideLinesStick.title"
                  )}
                  checked={guideLinesStick}
                  onChange={changeGuideLinesStick}
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Stage (Ratio/Width/Height/Min Zoom/Max Zoom/Zoom Step) */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
              <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                {t("toolBar.setting.children.stage.title")}
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
              <Stack
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <NumberInput
                  label={t(
                    "toolBar.setting.children.stage.children.ratio.title"
                  )}
                  value={stageRatio}
                  onChange={changeStageRatio}
                  min={0.5}
                  max={2}
                  step={0.1}
                  disabled={true}
                />

                <NumberInput
                  label={t(
                    "toolBar.setting.children.stage.children.width.title"
                  )}
                  min={stageMinWidth}
                  value={stageWidth}
                  onChange={changeStageSizeHandler.width}
                />

                <NumberInput
                  label={t(
                    "toolBar.setting.children.stage.children.height.title"
                  )}
                  min={stageRatio ? stageMinWidth / stageRatio : 0}
                  value={stageHeight}
                  onChange={changeStageSizeHandler.height}
                />
              </Stack>

              <Stack
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <NumberInput
                  label={t(
                    "toolBar.setting.children.stage.children.minZoom.title"
                  )}
                  value={stageZoomMin}
                  onChange={changeStageZoomHandler.min}
                  disabled={true}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                />

                <NumberInput
                  label={t(
                    "toolBar.setting.children.stage.children.maxZoom.title"
                  )}
                  value={stageZoomMax}
                  onChange={changeStageZoomHandler.max}
                  min={1.0}
                  max={3.0}
                  step={0.1}
                />

                <NumberInput
                  label={t(
                    "toolBar.setting.children.stage.children.zoomStep.title"
                  )}
                  value={stageZoomStep}
                  onChange={changeStageZoomHandler.step}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                />
              </Stack>
            </AccordionDetails>
          </Accordion>
        </>
      );
    }, [
      changeLanguage,
      changeMaxHistory,
      changeGuideLinesThreshold,
      changeGuideLinesStick,
      maxHistory,
      guideLinesThreshold,
      guideLinesStick,
      stageWidth,
      stageHeight,
      changeStageSizeHandler,
      stageZoomMin,
      stageZoomMax,
      stageZoomStep,
      changeStageZoomHandler,
    ]);

  const dialogAction: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <TooltipButton
          onClick={settingHandler.close}
          title={t("toolBar.setting.common.button.ok")}
        >
          {t("toolBar.setting.common.button.ok")}
        </TooltipButton>
      );
    }, [t]);

  return (
    <>
      <ButtonGroup variant={"contained"} size={"small"}>
        <TooltipButton
          icon={<SettingsTwoTone />}
          title={t("toolBar.setting.title")}
          onClick={settingHandler.open}
        />
      </ButtonGroup>

      {/* Setting Dialog */}
      <BasicDialog
        open={isSettingOpen}
        onClose={settingHandler.onClose}
        dialogTitle={dialogTitle}
        dialogContent={dialogContent}
        dialogAction={dialogAction}
      />
    </>
  );
});
