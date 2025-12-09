import { ToolbarAddRegularShape } from "./AddRegularShape";
import { ToolbarAddComponent } from "./AddComponent";
import { ToolbarUploadVideo } from "./UploadVideo";
import { ToolbarUploadImage } from "./UploadImage";
import { ToolbarAddTemplate } from "./AddTemplate";
import { ToolbarAddImage } from "./AddImage";
import { ButtonGroup } from "@mui/material";
import { ToolbarAddText } from "./AddText";
import { ToolbarAddIcon } from "./AddIcon";
import { ToolbarFakeAPI } from "./FakeAPI";
import React from "react";

export const ToolbarAddShape = React.memo((): React.JSX.Element => {
  return (
    <ButtonGroup variant={"contained"} size={"small"}>
      {/* Add Shapes (Line/Arrow/Circle/Rectangle/Convex Polygon/Concave Polygon/Ring/Wedge) */}
      <ToolbarAddRegularShape />

      {/* Add Icon */}
      <ToolbarAddIcon />

      {/* Fake API (insert icon by key at coordinates) */}
      <ToolbarFakeAPI />

      {/* Add Text */}
      <ToolbarAddText />

      {/* Add Image */}
      <ToolbarAddImage />

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
