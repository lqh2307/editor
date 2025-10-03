import { TextFieldProps } from "@mui/material";

export type CoordinateInputProp = Omit<TextFieldProps, "onChange" | "label"> & {
  title?: string;
  icon?: React.JSX.Element;
  display?: string;
  shrink?: boolean;

  toggleModeTitle?: string;

  isLat?: boolean;
  decimalLabel?: string;
  degreeLabel?: string;
  minuteLabel?: string;
  secondLabel?: string;

  delay?: number;
  onChange?: (value: number) => void;
};
