import { ToolbarAddRegularShape } from "./AddRegularShape";
import { ToolbarAddMilitaryIcon } from "./AddMilitaryIcon";
import { ToolbarAddComponent } from "./AddComponent";
import { ToolbarAddBasicIcon } from "./AddBasicIcon";
import { ToolbarUploadVideo } from "./UploadVideo";
import { ToolbarUploadImage } from "./UploadImage";
import { ToolbarAddTemplate } from "./AddTemplate";
import { ToolbarAddImage } from "./AddImage";
import { ButtonGroup } from "@mui/material";
import { ToolbarAddText } from "./AddText";
import React from "react";
import { ToolbarFakeAPI } from "./FakeApi";

export const ToolbarAddShape = React.memo((): React.JSX.Element => {
  return (
    <ButtonGroup variant={"contained"} size={"small"}>
      {/* Add Shapes (Line/Arrow/Circle/Rectangle/Convex Polygon/Concave Polygon/Ring/Wedge) */}
      <ToolbarAddRegularShape />

      {/* Add Basic Icon */}
      <ToolbarAddBasicIcon />

      {/* Add Military Icon */}
      <ToolbarAddMilitaryIcon />

      {/* Add Text */}
      <ToolbarAddText />

      {/* Add Image */}
      <ToolbarAddImage />

      {/*Fake API*/}
      <ToolbarFakeAPI/>

      {/* Add Component */}
      <ToolbarAddComponent />

      {/* Add Template */}
      <ToolbarAddTemplate />

      {/* Upload Image (From Device/From Link) */}
      <ToolbarUploadImage />

      {/* Upload Video (From Device/From Link) */}
      <ToolbarUploadVideo />
    </ButtonGroup>
  );
});
