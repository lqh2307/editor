import { ToolbarGeneralSetting } from "./GeneralSetting";
import { ToolbarStageSetting } from "./StageSetting";
import { Box, Divider, Stack } from "@mui/material";
import { useAppContext } from "../../contexts";
import { ToolbarAddShape } from "./AddShape";
import { ToolbarHistory } from "./History";
import { ToolbarDrawing } from "./Drawing";
import { ToolbarProfile } from "./Profile";
import { ToolbarAction } from "./Action";
import { ToolbarClose } from "./Close";
import { ToolbarZoom } from "./Zoom";
import { ToolbarHelp } from "./Help";
import { ToolbarIO } from "./IO";
import React from "react";

export const Toolbar = React.memo((): React.JSX.Element => {
  const { panelWidth } = useAppContext();

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
          justifyContent: "center",
          alignItems: "center",
          width: innerWidth - panelWidth,
          height: "100%",
        }}
        direction={"row"}
        divider={<Divider orientation={"vertical"} flexItem={true} />}
        spacing={1}
      >
        {/* Save/Export/Import */}
        <ToolbarIO />

        {/* Undo/Redo */}
        <ToolbarHistory />

        {/* Zoom In/Zoom Out/Fit Screen */}
        <ToolbarZoom />

        {/* Select All/Delete/Cut/Duplicate/Copy/Paste */}
        <ToolbarAction />

        {/* Add Shapes (Line/Arrow/Circle/Polygon/Rectangle)/Add Icons/Add Image/Add Text */}
        <ToolbarAddShape />

        {/* Free/Erase Drawing */}
        <ToolbarDrawing />

        {/* Background/Grid */}
        <ToolbarStageSetting />

        {/* General Setting */}
        <ToolbarGeneralSetting />

        {/* Help (Help/Information) */}
        <ToolbarHelp />

        {/* Close */}
        <ToolbarClose />
      </Stack>

      <Stack
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: panelWidth,
          height: "100%",
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
