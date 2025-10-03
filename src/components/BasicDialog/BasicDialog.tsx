import { BasicDialogProp } from "./Types";
import React from "react";
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
} from "@mui/material";

export const BasicDialog = React.memo(
  ({
    dialogTitle,
    dialogContent,
    dialogAction,
    ...props
  }: BasicDialogProp): React.JSX.Element => {
    return (
      <Dialog maxWidth={"xs"} fullWidth={true} {...props}>
        <DialogTitle>{dialogTitle}</DialogTitle>

        <DialogContent>{dialogContent}</DialogContent>

        <DialogActions>{dialogAction}</DialogActions>
      </Dialog>
    );
  }
);
