import { useDrawingContext, useShapesContext } from "../../contexts";
import { TooltipButton } from "../../components/TooltipButton";
import { useTranslation } from "react-i18next";
import { ButtonGroup } from "@mui/material";
import React from "react";
import {
  PolylineTwoTone,
  Crop169TwoTone,
  DrawTwoTone,
} from "@mui/icons-material";

export const ToolbarDrawing = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { drawingMode, setDrawingMode } = useDrawingContext();

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
        icon={<PolylineTwoTone />}
        title={t("toolBar.multiLine.title")}
        sx={{
          background: drawingMode === "multi-line" ? "grey" : "",
        }}
        onClick={changeDrawingModeHandler.multiLine}
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
        icon={<Crop169TwoTone sx={{ rotate: "-45deg" }} />}
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
