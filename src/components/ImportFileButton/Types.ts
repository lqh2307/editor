import { ButtonProps, TooltipProps } from "@mui/material";
import React from "react";

export type ImportFileButtonProp = ButtonProps & {
  title?: string;
  titlePlacement?: TooltipProps["placement"];
  icon?: React.JSX.Element;
  display?: string;

  delay?: number;

  acceptMimeType?: string;
  onFileLoaded: (file: File) => void;
};
