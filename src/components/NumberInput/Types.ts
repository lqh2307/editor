import { TextFieldProps } from "@mui/material";

export type NumberInputProp = Omit<TextFieldProps, "onChange"> & {
  title?: string;
  icon?: React.JSX.Element;
  display?: string;

  min?: number;
  max?: number;
  step?: number;

  shrink?: boolean;

  delay?: number;
  onChange?: (value: string) => void;
};
