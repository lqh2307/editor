import { TooltipButtonProp } from "./Types";
import { useDebounce } from "../../hooks";
import React from "react";
import {
  CircularProgress,
  Typography,
  Tooltip,
  Button,
  Box,
} from "@mui/material";

export const TooltipButton = React.memo(
  ({
    display = "flex",
    title,
    icon,
    onClick,
    delay = 200,
    isLoading,
    progress = 0,
    isDisplayProgress,
    children,
    sx,
    ...props
  }: TooltipButtonProp): React.JSX.Element => {
    const [debouncedEmit] = useDebounce(
      (value: string) => {
        onClick?.(value);
      },
      delay,
      [onClick]
    );

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>): void => {
        const target: EventTarget & HTMLButtonElement = e.currentTarget;

        if (delay > 0) {
          debouncedEmit(target?.value);
        } else {
          onClick?.(target?.value);
        }
      },
      [delay, debouncedEmit, onClick]
    );

    return (
      <Tooltip
        sx={{
          display: display,
        }}
        title={title}
      >
        <Box>
          <Button
            disabled={false}
            fullWidth={true}
            variant={"outlined"}
            type={"button"}
            size={"small"}
            onClick={handleClick}
            {...props}
            sx={{
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...(sx ?? {}),
            }}
          >
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-flex",
                    width: 24,
                    height: 24,
                  }}
                >
                  <CircularProgress
                    color={"inherit"}
                    variant={
                      isDisplayProgress ? "determinate" : "indeterminate"
                    }
                    value={progress}
                    size={20}
                  />

                  {isDisplayProgress && (
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 20,
                        height: 20,
                      }}
                    >
                      <Typography variant={"caption"} component={"div"}>
                        {`${progress}%`}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              (icon ?? children)
            )}
          </Button>
        </Box>
      </Tooltip>
    );
  }
);
