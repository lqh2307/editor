import { AutocompleteProps } from "@mui/material";

export type FreeSoloInputOption = {
  title?: string;
  value?: string;
};

export type FreeSoloInputProp = Omit<
  AutocompleteProps<FreeSoloInputOption, false, false, true>,
  "onChange" | "renderInput" | "value"
> & {
  title?: string;
  icon?: React.JSX.Element;
  display?: string;
  name?: string;
  label?: string;
  shrink?: boolean;
  type?: React.InputHTMLAttributes<unknown>["type"];
  min?: number;
  max?: number;
  step?: number;

  value?: unknown;

  options: FreeSoloInputOption[];
  delay?: number;
  onChange?: (value: string, bySelect: boolean) => void;
};
