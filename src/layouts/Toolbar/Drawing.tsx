import { useFreeDrawingContext, useShapesContext } from "../../contexts";
import { Crop169TwoTone, DrawTwoTone } from "@mui/icons-material";
import { TooltipButton } from "../../components/TooltipButton";
import { useTranslation } from "react-i18next";
import { ButtonGroup } from "@mui/material";
import React from "react";

export const ToolbarDrawing = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { freeDrawingMode, setFreeDrawingMode } = useFreeDrawingContext();

  const { selectedShape } = useShapesContext();

  const changeFreeDrawingModeHandler = React.useMemo(
    () => ({
      handleFreeDrawingPen: (): void =>
        setFreeDrawingMode((prev) => {
          switch (prev) {
            default: {
              return "pen";
            }

            case "pen": {
              return undefined;
            }

            case "eraser": {
              return "pen";
            }
          }
        }),
      handleFreeDrawingEraser: (): void =>
        setFreeDrawingMode((prev) => {
          switch (prev) {
            default: {
              return "eraser";
            }

            case "pen": {
              return "eraser";
            }

            case "eraser": {
              return undefined;
            }
          }
        }),
    }),
    [setFreeDrawingMode]
  );

  return (
    <ButtonGroup variant={"contained"} size={"small"}>
      <TooltipButton
        icon={<DrawTwoTone />}
        title={t("toolBar.drawing.title")}
        sx={{
          background: freeDrawingMode === "pen" ? "grey" : "",
        }}
        onClick={changeFreeDrawingModeHandler.handleFreeDrawingPen}
      />

      <TooltipButton
        icon={<Crop169TwoTone sx={{ rotate: "-45deg" }} />}
        title={t("toolBar.eraser.title")}
        sx={{
          background: freeDrawingMode === "eraser" ? "grey" : "",
        }}
        onClick={changeFreeDrawingModeHandler.handleFreeDrawingEraser}
        disabled={selectedShape.type !== "free-drawing"}
      />
    </ButtonGroup>
  );
});
