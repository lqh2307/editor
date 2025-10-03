import { SliderProps } from "@mui/material";
import React from "react";

export type SliderInputProp = Omit<SliderProps, "onChange"> & {
  title?: string;
  icon?: React.JSX.Element;
  display?: string;

  delay?: number;
  onChange?: (value: number) => void;
};
