import { CheckboxProps } from "@mui/material";
import React from "react";

export type TooltipCheckboxProp = Omit<CheckboxProps, "onChange"> & {
  title?: string;
  label?: React.JSX.Element;
  display?: string;

  delay?: number;
  onChange?: (checked: boolean, value: string) => void;
};
