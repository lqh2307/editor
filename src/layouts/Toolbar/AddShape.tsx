import { ToolbarAddRegularShape } from "./AddRegularShape";
import { ToolbarAddMilitaryIcon } from "./AddMilitaryIcon";
import { ToolbarAddComponent } from "./AddComponent";
import { ToolbarAddBasicIcon } from "./AddBasicIcon";
import { ToolbarUploadVideo } from "./UploadVideo";
import { ToolbarUploadImage } from "./UploadImage";
import { ToolbarAddTemplate } from "./AddTemplate";
import { ToolbarAddImage } from "./AddImage";
import { ButtonGroup, Paper, Box } from "@mui/material";
import { ToolbarAddText } from "./AddText";
import { ToolbarFakeAPI } from "./FakeApi";
import React from "react";
import { PopperButton } from "../../components/PopperButton";
import { CategoryTwoTone } from "@mui/icons-material";
import { ToolbarDrawing } from "./Drawing";
import { useTranslation } from "react-i18next";

export const ToolbarAddShape = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <ButtonGroup variant={"contained"} size={"small"}>
      {/* Unified Add menu */}
      <PopperButton
        icon={<CategoryTwoTone />}
        title={t("toolBar.addShape.title")}
        closeOnClickAway={false}
      >
        <Paper
          elevation={4}
          sx={{
            padding: "0.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "row", gap: "0.5rem", flexWrap: "wrap" }}>
            {/* Geometric Shapes */}
            <ToolbarAddRegularShape />

            {/* Basic Icons */}
            <ToolbarAddBasicIcon />

            {/* Military Icons */}
            <ToolbarAddMilitaryIcon />

            {/* Drawing Tools (Multi-line / Pen / Eraser) */}
            <ToolbarDrawing />
          </Box>
        </Paper>
      </PopperButton>

      {/* Keep other quick actions as standalone */}
      <ToolbarAddText />
      {/* <ToolbarAddImage /> */}
      {/* <ToolbarFakeAPI /> */}
      <ToolbarAddComponent />
      <ToolbarAddTemplate />
      <ToolbarUploadImage />
      {/* <ToolbarUploadVideo /> */}
    </ButtonGroup>
  );
});
