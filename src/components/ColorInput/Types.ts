import { TextFieldProps } from "@mui/material";

export type ColorInputProp = Omit<TextFieldProps, "onChange"> & {
  title?: string;
  icon?: React.JSX.Element;
  display?: string;

  delay?: number;
  onChange?: (value: string) => void;
};
