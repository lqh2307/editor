import { TooltipButton } from "../../components/TooltipButton";
import { PopperButton } from "../../components/PopperButton";
import { KonvaGridStyle } from "../../components/KonvaGrid";
import { SliderInput } from "../../components/SliderInput";
import { ColorInput } from "../../components/ColorInput";
import { normalizedMarks } from "../../types/Common";
import { ButtonGroup, Paper } from "@mui/material";
import { useStageContext } from "../../contexts";
import { useTranslation } from "react-i18next";
import React from "react";
import {
  FormatColorFillTwoTone,
  BorderClearTwoTone,
  BorderAllTwoTone,
  WallpaperTwoTone,
  OpacityTwoTone,
  GridOffTwoTone,
  GridOnTwoTone,
} from "@mui/icons-material";

export const ToolbarStageSetting = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const {
    backgroundColor,
    backgroundOpacity,
    gridStyle,
    setBackgroundColor,
    setBackgroundOpacity,
    setGridStyle,
  } = useStageContext();

  const changeBackgroundColorHandler = React.useCallback(
    (value: string): void => {
      setBackgroundColor(value);
    },
    [setBackgroundColor]
  );

  const changeBackgroundOpacityHandler = React.useCallback(
    (value: number): void => {
      setBackgroundOpacity(value);
    },
    [setBackgroundOpacity]
  );

  const changeGridStyleHandler = React.useCallback(
    (value: string): void => {
      setGridStyle(value as KonvaGridStyle);
    },
    [setGridStyle]
  );

  return (
    <ButtonGroup variant={"contained"} size={"small"}>
      {/* Background */}
      <PopperButton
        icon={<WallpaperTwoTone />}
        title={t("toolBar.background.title")}
      >
        <Paper
          elevation={4}
          sx={{
            padding: "0.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            minWidth: 110,
          }}
        >
          {/* Color */}
          <ColorInput
            icon={<FormatColorFillTwoTone fontSize={"small"} />}
            title={t("toolBar.background.children.color.title")}
            value={backgroundColor}
            onChange={changeBackgroundColorHandler}
          />

          {/* Opacity */}
          <SliderInput
            icon={<OpacityTwoTone fontSize={"small"} />}
            title={t("toolBar.background.children.opacity.title")}
            value={backgroundOpacity}
            max={1}
            step={0.05}
            marks={normalizedMarks}
            onChange={changeBackgroundOpacityHandler}
          />
        </Paper>
      </PopperButton>

      {/* Grid */}
      <PopperButton icon={<GridOnTwoTone />} title={t("toolBar.grid.title")}>
        <Paper
          elevation={4}
          sx={{
            padding: "0.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {/* Disabled */}
          <TooltipButton
            icon={
              <>
                <GridOffTwoTone
                  fontSize={"small"}
                  sx={{
                    marginRight: "0.25rem",
                  }}
                />
                {t("toolBar.grid.children.disabled.title")}
              </>
            }
            title={t("toolBar.grid.children.disabled.title")}
            value={"none"}
            onClick={changeGridStyleHandler}
            sx={{
              justifyContent: "flex-start",
              background: gridStyle === "none" ? "grey" : "",
            }}
          />

          {/* Dotted */}
          <TooltipButton
            icon={
              <>
                <BorderClearTwoTone
                  fontSize={"small"}
                  sx={{
                    marginRight: "0.25rem",
                  }}
                />
                {t("toolBar.grid.children.dotted.title")}
              </>
            }
            title={t("toolBar.grid.children.dotted.title")}
            value={"dotted"}
            onClick={changeGridStyleHandler}
            sx={{
              justifyContent: "flex-start",
              background: gridStyle === "dotted" ? "grey" : "",
            }}
          />

          {/* Solid */}
          <TooltipButton
            icon={
              <>
                <BorderAllTwoTone
                  fontSize={"small"}
                  sx={{
                    marginRight: "0.25rem",
                  }}
                />
                {t("toolBar.grid.children.solid.title")}
              </>
            }
            title={t("toolBar.grid.children.solid.title")}
            value={"solid"}
            onClick={changeGridStyleHandler}
            sx={{
              justifyContent: "flex-start",
              background: gridStyle === "solid" ? "grey" : "",
            }}
          />
        </Paper>
      </PopperButton>
    </ButtonGroup>
  );
});
