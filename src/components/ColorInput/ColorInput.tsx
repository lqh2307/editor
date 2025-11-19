import { Box, Stack, TextField, Tooltip } from "@mui/material";
import { useDebounce } from "../../hooks";
import { ColorInputProp } from "./Types";
import React from "react";

export const ColorInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    onChange,
    delay = 200,
    value,
    defaultValue = "#000000",
    slotProps,
    sx,
    ...props
  }: ColorInputProp): React.JSX.Element => {
    const [localValue, setLocalValue] = React.useState<string>(
      String(value ?? defaultValue)
    );

    React.useEffect(() => {
      setLocalValue(String(value ?? defaultValue));
    }, [value, defaultValue]);

    const [debouncedEmit] = useDebounce(
      (value: string) => {
        onChange?.(value);
      },
      delay,
      [onChange]
    );

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newVal: string = String(e.target?.value ?? defaultValue);

        setLocalValue(newVal);

        if (delay > 0) {
          debouncedEmit(newVal);
        } else {
          onChange?.(newVal);
        }
      },
      [delay, debouncedEmit, onChange, defaultValue]
    );

    return (
      <Stack
        sx={{
          display: display,
          flexDirection: "row",
          gap: "1rem",
          alignItems: "center",
          width: "100%",
        }}
      >
        {icon && (
          <Tooltip title={title}>
            <Box>{icon}</Box>
          </Tooltip>
        )}

        <TextField
          disabled={false}
          variant={"standard"}
          size={"small"}
          fullWidth={true}
          type={"color"}
          {...props}
          onChange={handleChange}
          value={localValue}
          sx={{
            "& input": {
              fontSize: 12,
              cursor: "pointer",
            },
            ...(sx ?? {}),
          }}
          slotProps={{
            ...(slotProps ?? {}),
            input: {
              ...(slotProps?.input ?? {}),
              disableUnderline: true,
            },
          }}
        />
      </Stack>
    );
  }
);
