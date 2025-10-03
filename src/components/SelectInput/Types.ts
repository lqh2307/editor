import { MenuItemProps, TextFieldProps } from "@mui/material";
import { SyntheticEvent } from "react";

export type SelectInputOption = {
  title?: string;
  value?: string;

  menuItemProp?: MenuItemProps;
};

export type SelectInputProp = Omit<TextFieldProps, "onChange"> & {
  title?: string;
  icon?: React.JSX.Element;
  display?: string;

  shrink?: boolean;
  options: SelectInputOption[];

  delay?: number;
  onChange?: (value: string) => void;
  onOpen?: (event: SyntheticEvent<Element, Event>) => void;
};
