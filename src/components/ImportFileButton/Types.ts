import { ButtonProps } from "@mui/material/Button";
import React from "react";

export type ImportFileButtonProp = ButtonProps & {
  title?: string;
  icon?: React.JSX.Element;
  display?: string;

  delay?: number;

  acceptMimeType?: string;
  onFileLoaded: (file: File) => void;
};
