import { Box, Stack, TextField, Tooltip } from "@mui/material";
import { useDebounce } from "../../hooks";
import { NumberInputProp } from "./Types";
import React from "react";

export const NumberInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    min = 0,
    max = 65536,
    step = 1,
    shrink = true,
    delay = 200,
    value,
    defaultValue = "0",
    onChange,
    slotProps,
    sx,
    ...props
  }: NumberInputProp): React.JSX.Element => {
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
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
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
          flexGrow: 1,
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
          type={"number"}
          {...props}
          sx={{
            "& input": {
              fontSize: 12,
            },
            ...(sx ?? {}),
          }}
          onChange={handleChange}
          value={localValue}
          slotProps={{
            ...(slotProps ?? {}),
            inputLabel: {
              ...((slotProps?.inputLabel as any) ?? {}),
              shrink: shrink,
            },
            htmlInput: {
              ...(slotProps?.htmlInput ?? {}),
              min: min,
              max: max,
              step: step,
            },
          }}
        />
      </Stack>
    );
  }
);
