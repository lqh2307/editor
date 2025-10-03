import { Alert, Box, Snackbar } from "@mui/material";
import { SnackbarAlertProp } from "./Types";
import React from "react";

export const SnackbarAlert = React.memo(
  ({
    open,
    autoHideDuration,
    message,
    children,
    id,
    ...props
  }: SnackbarAlertProp): React.JSX.Element => {
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const timeoutIdRef = React.useRef<NodeJS.Timeout>(undefined);

    React.useEffect(() => {
      setIsOpen(open);

      if (open) {
        clearTimeout(timeoutIdRef.current);

        if (autoHideDuration) {
          timeoutIdRef.current = setTimeout(() => {
            setIsOpen(false);
          }, autoHideDuration);
        }
      }

      return () => {
        clearTimeout(timeoutIdRef.current);
      };
    }, [open, autoHideDuration, id]);

    const handleClose = React.useCallback(
      (_: Event | React.SyntheticEvent<any, Event>, reason?: string): void => {
        if (reason === "clickaway") {
          return;
        }

        setIsOpen(false);
      },
      []
    );

    return (
      <Snackbar
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Alert
          severity={"success"}
          variant={"filled"}
          onClose={handleClose}
          {...props}
        >
          {children ?? <Box>{message}</Box>}
        </Alert>
      </Snackbar>
    );
  }
);
