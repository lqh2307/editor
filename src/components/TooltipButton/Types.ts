import { ButtonProps, TooltipProps } from "@mui/material";
import React from "react";

export type TooltipButtonProp = Omit<ButtonProps, "onClick"> & {
  title?: string;
  titlePlacement?: TooltipProps["placement"];
  icon?: React.JSX.Element;
  display?: string;

  delay?: number;
  onClick?: (value: string) => void;

  isLoading?: boolean;
  progress?: number;
  isDisplayProgress?: boolean;
};
