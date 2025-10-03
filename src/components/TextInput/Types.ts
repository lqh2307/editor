import { TextFieldProps } from "@mui/material";

export type TextInputProp = Omit<TextFieldProps, "onChange"> & {
  title?: string;
  icon?: React.JSX.Element;
  display?: string;

  minLength?: number;
  maxLength?: number;

  shrink?: boolean;

  delay?: number;
  onChange?: (value: string) => void;
};
