export type EditorProp = {
  language?: string;

  guideLinesThreshold?: number;

  guideLinesStick?: boolean;

  panelWidth?: number;
  panelColor?: string;

  canvasColor?: string;

  toolbarHeight?: number;
  toolbarColor?: string;

  stageZoomMin?: number;
  stageZoomMax?: number;
  stageZoomStep?: number;

  minStageWidth?: number;
  stageRatio?: number;

  maxHistory?: number;
};
