import { useStageContext, useShapesContext } from "../../contexts";
import { TooltipButton } from "../../components/TooltipButton";
import { PiWaveTriangle, PiWaveSine } from "react-icons/pi";
import { HiMiniArrowTrendingUp } from "react-icons/hi2";
import { TbArrowWaveRightUp } from "react-icons/tb";
import { DrawTwoTone } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { PiEraserFill } from "react-icons/pi";
import { ButtonGroup } from "@mui/material";
import React from "react";

export const ToolbarDrawing = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { drawingMode, setDrawingMode } = useStageContext();

  const { selectedShape } = useShapesContext();

  const changeDrawingModeHandler = React.useMemo(
    () => ({
      multiLine: (): void =>
        setDrawingMode((prev) => {
          switch (prev) {
            default: {
              return "multi-line";
            }

            case "multi-line": {
              return undefined;
            }
          }
        }),
      multiLineCurve: (): void =>
        setDrawingMode((prev) => {
          switch (prev) {
            default: {
              return "multi-line-curve";
            }

            case "multi-line-curve": {
              return undefined;
            }
          }
        }),
      multiArrow: (): void =>
        setDrawingMode((prev) => {
          switch (prev) {
            default: {
              return "multi-arrow";
            }

            case "multi-arrow": {
              return undefined;
            }
          }
        }),
      multiArrowCurve: (): void =>
        setDrawingMode((prev) => {
          switch (prev) {
            default: {
              return "multi-arrow-curve";
            }

            case "multi-arrow-curve": {
              return undefined;
            }
          }
        }),
      pen: (): void =>
        setDrawingMode((prev) => {
          switch (prev) {
            default: {
              return "source-over";
            }

            case "source-over": {
              return undefined;
            }

            case "destination-out": {
              return "source-over";
            }
          }
        }),
      eraser: (): void =>
        setDrawingMode((prev) => {
          switch (prev) {
            default: {
              return "destination-out";
            }

            case "source-over": {
              return "destination-out";
            }

            case "destination-out": {
              return undefined;
            }
          }
        }),
    }),
    [setDrawingMode]
  );

  return (
    <ButtonGroup variant={"contained"} size={"small"}>
      <TooltipButton
        icon={<PiWaveTriangle fontSize={"24px"} />}
        title={t("toolBar.multiLine.title")}
        sx={{
          background: drawingMode === "multi-line" ? "grey" : "",
        }}
        onClick={changeDrawingModeHandler.multiLine}
      />

      <TooltipButton
        icon={<HiMiniArrowTrendingUp fontSize={"24px"} />}
        title={t("toolBar.multiArrow.title")}
        sx={{
          background: drawingMode === "multi-arrow" ? "grey" : "",
        }}
        onClick={changeDrawingModeHandler.multiArrow}
      />

      <TooltipButton
        icon={<PiWaveSine fontSize={"24px"} />}
        title={t("toolBar.multiLineCurve.title")}
        sx={{
          background: drawingMode === "multi-line-curve" ? "grey" : "",
        }}
        onClick={changeDrawingModeHandler.multiLineCurve}
      />

      <TooltipButton
        icon={<TbArrowWaveRightUp fontSize={"24px"} />}
        title={t("toolBar.multiArrowCurve.title")}
        sx={{
          background: drawingMode === "multi-arrow-curve" ? "grey" : "",
        }}
        onClick={changeDrawingModeHandler.multiArrowCurve}
      />

      <TooltipButton
        icon={<DrawTwoTone />}
        title={t("toolBar.drawing.title")}
        sx={{
          background: drawingMode === "source-over" ? "grey" : "",
        }}
        onClick={changeDrawingModeHandler.pen}
      />

      <TooltipButton
        icon={<PiEraserFill fontSize={"24px"} />}
        title={t("toolBar.eraser.title")}
        sx={{
          background: drawingMode === "destination-out" ? "grey" : "",
        }}
        onClick={changeDrawingModeHandler.eraser}
        disabled={selectedShape.type !== "free-drawing"}
      />
    </ButtonGroup>
  );
});
