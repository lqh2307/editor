import { KonvaGridStyle } from "../components/KonvaGrid";
import { DrawingMode } from "../types/FreeDrawing";
import React from "react";

export type StageProviderProp = {
  children?: React.ReactNode;

  language: string;

  backGroundColor: string;
  backgroundOpacity: number;

  gridStyle: KonvaGridStyle;

  stageZoom: number;
  canvasWidth: number;
  canvasHeight: number;
  stageWidth: number;
  stageHeight: number;

  guideLinesThreshold: number;
  guideLinesStick: boolean;

  panelWidth: number;
  panelColor: string;

  canvasColor: string;

  toolbarHeight: number;
  toolbarColor: string;

  stageMinWidth: number;
  stageRatio: number;

  stageZoomMin: number;
  stageZoomMax: number;
  stageZoomStep: number;
};

export type DrawingProviderProp = {
  children?: React.ReactNode;
};

export type ShapesProviderProp = {
  children?: React.ReactNode;

  maxHistory: number;
};
