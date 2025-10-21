import { ClickAwayListener, Tooltip, Button, Popper, Box } from "@mui/material";
import { PopperButtonProp } from "./Types";
import { useDebounce } from "../../hooks";
import React from "react";

export const PopperButton = React.memo(
  ({
    display = "flex",
    title,
    icon,
    placement = "bottom-start",
    delay = 200,
    children,
    onClick,
    sx,
    ...props
  }: PopperButtonProp): React.JSX.Element => {
    const [anchorEl, setAnchorEl] =
      React.useState<HTMLButtonElement>(undefined);

    const [debouncedEmit] = useDebounce(
      (target: HTMLButtonElement) => {
        setAnchorEl((prev) => (prev ? undefined : target));

        onClick?.(target?.value);
      },
      delay,
      []
    );

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>): void => {
        const target: EventTarget & HTMLButtonElement = e.currentTarget;

        if (delay > 0) {
          debouncedEmit(target);
        } else {
          setAnchorEl((prev) => (prev ? undefined : target));

          onClick?.(e.currentTarget?.value);
        }
      },
      [delay, debouncedEmit, onClick]
    );

    const handleClose = React.useCallback((): void => {
      setAnchorEl(undefined);
    }, []);

    return (
      <ClickAwayListener onClickAway={handleClose}>
        <Box
          sx={{
            display: display,
          }}
        >
          <Tooltip title={title}>
            <Box>
              <Button
                disabled={false}
                fullWidth={true}
                variant={"outlined"}
                type={"button"}
                size={"small"}
                {...props}
                sx={{
                  minWidth: 0,
                  minHeight: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...(sx ?? {}),
                }}
                onClick={handleClick}
              >
                {icon ? icon : <></>}
              </Button>
            </Box>
          </Tooltip>

          <Popper open={!!anchorEl} anchorEl={anchorEl} placement={placement}>
            {children}
          </Popper>
        </Box>
      </ClickAwayListener>
    );
  }
);
