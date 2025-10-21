import { Autocomplete, Box, Stack, TextField, Tooltip } from "@mui/material";
import { FreeSoloInputOption, FreeSoloInputProp } from "./Types";
import { useDebounce } from "../../hooks";
import React from "react";

export const FreeSoloInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    options,
    type,
    label,
    name,
    min,
    max,
    step,
    shrink = true,
    onChange,
    delay = 200,
    value,
    defaultValue = "",
    ...props
  }: FreeSoloInputProp): React.JSX.Element => {
    const [localValue, setLocalValue] = React.useState<string>(
      String(value ?? defaultValue)
    );

    React.useEffect(() => {
      setLocalValue(String(value ?? defaultValue));
    }, [value, defaultValue]);

    const [debouncedEmit] = useDebounce(
      (value: string, bySelect: boolean) => {
        onChange?.(value, bySelect);
      },
      delay,
      [onChange]
    );

    const handleSelect = React.useCallback(
      (_: React.SyntheticEvent, option: FreeSoloInputOption | string): void => {
        const newVal: string =
          typeof option === "string"
            ? String(option ?? defaultValue)
            : String(option?.value ?? defaultValue);

        setLocalValue(newVal);

        if (delay > 0) {
          debouncedEmit(newVal, true);
        } else {
          onChange?.(newVal, true);
        }
      },
      [delay, debouncedEmit, onChange, defaultValue]
    );

    const handleInput = React.useCallback(
      (_: React.SyntheticEvent, value: string): void => {
        const newVal: string = String(value ?? defaultValue);

        setLocalValue(newVal);

        if (delay > 0) {
          debouncedEmit(value, false);
        } else {
          onChange?.(value, false);
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
        <Autocomplete
          size={"small"}
          fullWidth={true}
          disableClearable={true}
          freeSolo={true}
          options={options}
          getOptionLabel={(opt: FreeSoloInputOption | string) =>
            typeof opt === "string" ? opt : (opt.title ?? "")
          }
          isOptionEqualToValue={(opt, val) =>
            (typeof opt === "string" ? opt : (opt.value ?? defaultValue)) ===
            val
          }
          {...props}
          onChange={handleSelect}
          onInputChange={handleInput}
          value={localValue}
          renderInput={(params) => (
            <TextField
              variant={"standard"}
              size={"small"}
              type={type}
              name={name}
              sx={{
                "& input": {
                  fontSize: 12,
                },
              }}
              label={label}
              {...params}
              slotProps={{
                inputLabel: {
                  shrink: shrink,
                },
                htmlInput: {
                  ...params.inputProps,
                  min: min,
                  max: max,
                  step: step,
                },
              }}
            />
          )}
        />
      </Stack>
    );
  }
);
