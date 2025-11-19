import { ButtonProps, PopperPlacementType, TooltipProps } from "@mui/material";
import React from "react";

export type PopperButtonProp = Omit<ButtonProps, "onClick"> & {
  title?: string;
  titlePlacement?: TooltipProps["placement"];
  icon?: React.JSX.Element;
  display?: string;

  placement?: PopperPlacementType;

  delay?: number;
  onClick?: (value: string) => void;
};
