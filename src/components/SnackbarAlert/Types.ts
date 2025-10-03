import { AlertProps } from "@mui/material";

export type SnackbarAlertProp = Omit<AlertProps, "onClose"> & {
  open?: boolean;
  autoHideDuration?: number;
  message?: string;
};
