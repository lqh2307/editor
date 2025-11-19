import { RadioProps } from "@mui/material";
import React from "react";

export type TooltipRadioProp = Omit<RadioProps, "onChange"> & {
  title?: string;
  label?: React.JSX.Element;
  display?: string;

  delay?: number;
  onChange?: (checked: boolean, value: string) => void;
};
