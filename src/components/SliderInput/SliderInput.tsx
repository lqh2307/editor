import { Box, Slider, Stack, Tooltip } from "@mui/material";
import { useDebounce } from "../../hooks";
import { SliderInputProp } from "./Types";
import React from "react";

export const SliderInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    min = 0,
    max = 65536,
    step = 1,
    onChange,
    delay = 200,
    value,
    defaultValue = 0,
    sx,
    ...props
  }: SliderInputProp): React.JSX.Element => {
    const [localValue, setLocalValue] = React.useState<number>(
      Number(value ?? defaultValue)
    );

    React.useEffect(() => {
      setLocalValue(Number(value ?? defaultValue));
    }, [value, defaultValue]);

    const [debouncedEmit] = useDebounce(
      (value: number) => {
        onChange?.(value);
      },
      delay,
      [onChange]
    );

    const handleChange = React.useCallback(
      (_: Event, value: number): void => {
        const newVal: number = Number(value ?? defaultValue);

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

        <Slider
          size={"small"}
          valueLabelDisplay={"auto"}
          min={min}
          max={max}
          step={step}
          {...props}
          sx={{
            "& .MuiSlider-markLabel": {
              fontSize: 10,
            },
            ...(sx ?? {}),
          }}
          onChange={handleChange}
          value={localValue}
        />
      </Stack>
    );
  }
);
