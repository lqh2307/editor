import { ButtonProps } from "@mui/material/Button";
import React from "react";

export type TooltipButtonProp = Omit<ButtonProps, "onClick"> & {
  title?: string;
  icon?: React.JSX.Element;
  display?: string;

  delay?: number;
  onClick?: (value: string) => void;

  isLoading?: boolean;
  progress?: number;
  isDisplayProgress?: boolean;
};
