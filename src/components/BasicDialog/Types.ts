import { DialogProps } from "@mui/material";

export type BasicDialogProp = DialogProps & {
  dialogTitle?: React.JSX.Element;
  dialogContent?: React.JSX.Element;
  dialogAction?: React.JSX.Element;
};
