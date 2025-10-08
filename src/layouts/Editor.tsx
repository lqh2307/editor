import { limitValue } from "../utils/Number";
import { EditorProp } from "./Types";
import { Box } from "@mui/material";
import { Toolbar } from "./Toolbar";
import { Canvas } from "./Canvas";
import { Panel } from "./Panel";
import React from "react";
import {
  FreeDrawingProvider,
  ShapesProvider,
  StageProvider,
  AppProvider,
} from "../contexts";

export const Editor = React.memo((prop: EditorProp): React.JSX.Element => {
  const {
    language = "vietnamese",

    guideLinesThreshold = 15,

    guideLinesStick = true,

    toolbarHeight = 60,
    toolbarColor = "#e5e5e5",

    canvasColor = "#eeeeee",

    panelWidth = 250,
    panelColor = "#e5e5e5",

    stageZoomMin = 0.1,
    stageZoomMax = 2,
    stageZoomStep = 0.1,

    maxHistory = 50,
  }: EditorProp = prop;

  // Init
  const canvasWidth: number = innerWidth - panelWidth;
  const canvasHeight: number = innerHeight - toolbarHeight;

  const stageRatio: number = Math.SQRT2;

  let stageWidth: number = canvasWidth;
  let stageHeight: number = stageWidth / stageRatio;

  if (stageHeight < canvasHeight) {
    stageHeight = canvasHeight;
    stageWidth = stageHeight * stageRatio;
  }

  const scaleX: number = canvasWidth / stageWidth;
  const scaleY: number = canvasHeight / stageHeight;
  const stageZoom: number = limitValue(
    scaleX < scaleY ? scaleX : scaleY,
    stageZoomMin,
    stageZoomMax
  );

  return (
    <AppProvider
      language={language}
      guideLinesThreshold={guideLinesThreshold}
      guideLinesStick={guideLinesStick}
      panelWidth={panelWidth}
      panelColor={panelColor}
      canvasColor={canvasColor}
      toolbarHeight={toolbarHeight}
      toolbarColor={toolbarColor}
    >
      <StageProvider
        stageZoom={stageZoom}
        stageZoomMin={stageZoomMin}
        stageZoomMax={stageZoomMax}
        stageZoomStep={stageZoomStep}
        stageRatio={stageRatio}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        stageWidth={stageWidth}
        stageHeight={stageHeight}
      >
        <FreeDrawingProvider>
          <ShapesProvider maxHistory={maxHistory}>
            <Box
              sx={{
                position: "relative",
                padding: 0,
                margin: 0,
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {/* Toolbar */}
              <Box
                sx={{
                  position: "fixed",
                  overflowX: "auto",
                  overflowY: "hidden",
                  margin: 0,
                  padding: 0,
                  top: 0,
                  left: 0,
                  right: 0,
                  height: toolbarHeight,
                  boxSizing: "border-box",
                  borderBottom: "1px solid #e0e0e0",
                  display: "flex",
                  backgroundColor: toolbarColor,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Toolbar />
              </Box>

              {/* Canvas */}
              <Box
                sx={{
                  position: "absolute",
                  overflow: "hidden",
                  top: toolbarHeight,
                  right: panelWidth,
                  left: 0,
                  bottom: 0,
                  margin: 0,
                  padding: 0,
                  boxSizing: "border-box",
                  backgroundImage: `repeating-conic-gradient(${canvasColor} 0% 25%, #ffffff 0% 50%)`,
                  backgroundSize: "100px 100px",
                }}
              >
                <Canvas />
              </Box>

              {/* Panel */}
              <Box
                sx={{
                  position: "absolute",
                  overflowX: "hidden",
                  overflowY: "auto",
                  margin: 0,
                  padding: "0.25rem",
                  top: toolbarHeight,
                  right: 0,
                  bottom: 0,
                  width: panelWidth,
                  boxSizing: "border-box",
                  borderLeft: "1px solid #e0e0e0",
                  backgroundColor: panelColor,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Panel />
              </Box>
            </Box>
          </ShapesProvider>
        </FreeDrawingProvider>
      </StageProvider>
    </AppProvider>
  );
});
