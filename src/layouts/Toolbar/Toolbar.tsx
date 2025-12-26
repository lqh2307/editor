import { ToolbarGeneralSetting } from "./GeneralSetting";
import { ToolbarStageSetting } from "./StageSetting";
import { Box, Divider, Stack } from "@mui/material";
import { ToolbarAddShape } from "./AddShape";
import { ToolbarHistory } from "./History";
import { ToolbarProfile } from "./Profile";
import { ToolbarAction } from "./Action";
import { ToolbarZoom } from "./Zoom";
import { ToolbarHelp } from "./Help";
import { ToolbarIO } from "./IO";
import React from "react";
import { ButtonGroup, Paper } from "@mui/material";
import { PopperButton } from "../../components/PopperButton";
import { AppsTwoTone } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export const Toolbar = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
      }}
    >
      <Stack
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "start",
          alignItems: "center",
          width: "100%",
          height: "100%",
          overflowX: "auto",
          paddingLeft: "0.5rem",
        }}
        direction={"row"}
        divider={<Divider orientation={"vertical"} flexItem={true} />}
        spacing={1}
      >
        {/* Only group IO into a single menu button */}
        <ButtonGroup variant={"contained"} size={"small"}>
          <PopperButton
            icon={<AppsTwoTone />}
            title={t("toolBar.menu.title") ?? "Menu"}
            closeOnClickAway={false}
            placement={"bottom-start"}
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
                {/* Save/Export/Import */}
                <ToolbarIO />
              </Box>
            </Paper>
          </PopperButton>
        </ButtonGroup>

        {/* Undo/Redo */}
        <ToolbarHistory />

        {/* Zoom In/Zoom Out/Fit Screen */}
        <ToolbarZoom />

        {/* Group/Ungroup/Select All/Delete/Cut/Duplicate/Copy/Paste */}
        <ToolbarAction />

        {/* Add Shapes (Line/Arrow/Circle/Polygon/Rectangle)/Add Icons/Add Image/Add Text */}
        <ToolbarAddShape />

        {/* Background/Grid */}
        <ToolbarStageSetting />

        {/* General Setting */}
        <ToolbarGeneralSetting />

        {/* Help (Help/Information) */}
        <ToolbarHelp />
      </Stack>

      <Stack
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "5%",
          height: "100%",
          overflowX: "hidden",
        }}
        direction={"row"}
        divider={<Divider orientation={"vertical"} flexItem={true} />}
        spacing={1}
      >
        {/* Profile */}
        <ToolbarProfile />
      </Stack>
    </Box>
  );
});
