import { Box, Stack, TextField, Tooltip } from "@mui/material";
import { useDebounce } from "../../hooks";
import { TextInputProp } from "./Types";
import React from "react";

export const TextInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    minLength = 0,
    maxLength = 1000,
    shrink = true,
    delay = 200,
    value,
    defaultValue = "",
    onChange,
    sx,
    ...props
  }: TextInputProp): React.JSX.Element => {
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
          type={"text"}
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
            ...(props.slotProps ?? {}),
            inputLabel: {
              ...((props.slotProps?.inputLabel as any) ?? {}),
              shrink: shrink,
            },
            htmlInput: {
              ...(props.slotProps?.htmlInput ?? {}),
              minLength: minLength,
              maxLength: maxLength,
            },
          }}
        />
      </Stack>
    );
  }
);
