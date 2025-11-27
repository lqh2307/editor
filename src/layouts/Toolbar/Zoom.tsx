import { useDebounceHotKey } from "../../hooks/useDebounceHotKey";
import { TooltipButton } from "../../components/TooltipButton";
import { useStageContext } from "../../contexts";
import { useTranslation } from "react-i18next";
import { ButtonGroup } from "@mui/material";
import React from "react";
import {
  FitScreenTwoTone,
  ZoomOutTwoTone,
  ZoomInTwoTone,
} from "@mui/icons-material";

export const ToolbarZoom = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const {
    fitStageScreen,
    updateSnackbarAlert,
    zoomStage,
    stageZoom,
    stageZoomMin,
    stageZoomMax,
  } = useStageContext();

  const fitStageScreenHandler = React.useCallback((): void => {
    fitStageScreen(false);
  }, [fitStageScreen]);

  const zoomStageHandler = React.useCallback(
    (value: string): void => {
      if (value && stageZoom > stageZoomMin) {
        zoomStage(true, false);
      } else if (!value && stageZoom < stageZoomMax) {
        zoomStage(false, false);
      }
    },
    [zoomStage, stageZoom, stageZoomMax]
  );

  const zoomStageToPointerHandler = React.useCallback(
    (value?: string): void => {
      if (value && stageZoom > stageZoomMin) {
        zoomStage(true, true);
      } else if (!value && stageZoom < stageZoomMax) {
        zoomStage(false, true);
      }
    },
    [zoomStage, stageZoom, stageZoomMax]
  );

  React.useEffect(() => {
    updateSnackbarAlert(
      `${t("toolBar.zoom.common.snackBarAlert.current")} ${stageZoom}`,
      "info"
    );
  }, [stageZoom, updateSnackbarAlert, t]);

  useDebounceHotKey({
    keys: ["ctrl+plus", "cmd+plus"],
    callback: () => {
      zoomStageToPointerHandler();
    },
    deps: [zoomStageToPointerHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+minus", "cmd+minus"],
    callback: () => {
      zoomStageToPointerHandler("true");
    },
    deps: [zoomStageToPointerHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+0", "cmd+0"],
    callback: () => {
      fitStageScreenHandler();
    },
    deps: [fitStageScreenHandler],
  });

  return (
    <ButtonGroup variant={"contained"} size={"small"}>
      {/* Zoom In */}
      <TooltipButton
        icon={<ZoomInTwoTone />}
        title={t("toolBar.zoom.children.in.title")}
        disabled={stageZoom === stageZoomMax}
        onClick={zoomStageHandler}
      />

      {/* Zoom Out */}
      <TooltipButton
        icon={<ZoomOutTwoTone />}
        title={t("toolBar.zoom.children.out.title")}
        disabled={stageZoom === stageZoomMin}
        value={"true"}
        onClick={zoomStageHandler}
      />

      {/* Fit Screen */}
      <TooltipButton
        icon={<FitScreenTwoTone />}
        title={t("toolBar.fitScreen.title")}
        onClick={fitStageScreenHandler}
      />
    </ButtonGroup>
  );
});
