import React from "react";

export type StageProviderProp = {
  children?: React.ReactNode;

  stageZoom: number;

  stageZoomMin: number;
  stageZoomMax: number;
  stageZoomStep: number;

  canvasWidth: number;
  canvasHeight: number;

  stageWidth: number;
  stageHeight: number;
};

export type AppProviderProp = {
  children?: React.ReactNode;

  language: string;

  guideLinesThreshold: number;

  guideLinesStick: boolean;

  panelWidth: number;
  panelColor: string;

  canvasColor: string;

  toolbarHeight: number;
  toolbarColor: string;

  minStageWidth: number;
  stageRatio: number;
};

export type DrawingProviderProp = {
  children?: React.ReactNode;
};

export type ShapesProviderProp = {
  children?: React.ReactNode;

  maxHistory: number;
};
