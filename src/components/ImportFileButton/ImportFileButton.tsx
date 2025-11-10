import { Box, Button, Tooltip } from "@mui/material";
import { ImportFileButtonProp } from "./Types";
import { useDebounce } from "../../hooks";
import React, { useRef } from "react";

export const ImportFileButton = React.memo(
  ({
    display = "flex",
    title,
    icon,
    delay = 200,
    onFileLoaded,
    acceptMimeType,
    titlePlacement = "bottom",
    sx,
    ...props
  }: ImportFileButtonProp): React.JSX.Element => {
    const fileInputRef = useRef<HTMLInputElement>(undefined);

    const [debouncedEmit] = useDebounce(
      (file: File) => {
        onFileLoaded?.(file);
      },
      delay,
      [onFileLoaded]
    );

    const handleButtonClick = React.useCallback((): void => {
      fileInputRef.current?.click();
    }, []);

    const handleFileChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target?.files?.[0];
        if (!file) {
          return;
        }

        if (delay > 0) {
          debouncedEmit(file);
        } else {
          onFileLoaded?.(file);
        }

        e.target.value = "";
      },
      [debouncedEmit, delay, onFileLoaded]
    );

    return (
      <Box
        sx={{
          display: display,
        }}
      >
        <Tooltip title={title} placement={titlePlacement}>
          <Box>
            <Button
              fullWidth={true}
              variant={"outlined"}
              size={"small"}
              type={"button"}
              onClick={handleButtonClick}
              {...props}
              sx={{
                minWidth: 0,
                alignItems: "center",
                justifyContent: "center",
                ...(sx ?? {}),
              }}
            >
              {icon ? icon : <></>}
            </Button>
          </Box>
        </Tooltip>

        <input
          type={"file"}
          accept={acceptMimeType}
          style={{
            display: "none",
          }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </Box>
    );
  }
);
