import { SwitchProps } from "@mui/material";
import React from "react";

export type TooltipSwitchProp = Omit<SwitchProps, "onChange"> & {
  title?: string;
  label?: React.JSX.Element;
  display?: string;

  delay?: number;
  onChange?: (checked: boolean, value: string) => void;
};
