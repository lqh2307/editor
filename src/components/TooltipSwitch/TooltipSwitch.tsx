import { Stack, Tooltip, Switch, Box } from "@mui/material";
import { TooltipSwitchProp } from "./Types";
import { useDebounce } from "../../hooks";
import React from "react";

export const TooltipSwitch = React.memo(
  ({
    display = "flex",
    title,
    label,
    onChange,
    delay = 200,
    checked,
    value,
    defaultChecked = false,
    defaultValue = "",
    ...props
  }: TooltipSwitchProp): React.JSX.Element => {
    const [localChecked, setLocalChecked] = React.useState<boolean>(
      checked ?? defaultChecked
    );
    const [localValue, setLocalValue] = React.useState<string>(
      String(value ?? defaultValue)
    );

    React.useEffect(() => {
      setLocalChecked(checked ?? defaultChecked);
    }, [checked, defaultChecked]);

    React.useEffect(() => {
      setLocalValue(String(value ?? defaultValue));
    }, [value, defaultValue]);

    const [debouncedEmit] = useDebounce(
      (checked: boolean, value: string) => {
        onChange?.(checked, value);
      },
      delay,
      [onChange]
    );

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
        const newChe: boolean = checked ?? defaultChecked;
        const newVal: string = String(e.target?.value ?? defaultValue);

        setLocalChecked(newChe);
        setLocalValue(newVal);

        if (delay > 0) {
          debouncedEmit(newChe, newVal);
        } else {
          onChange?.(newChe, newVal);
        }
      },
      [delay, debouncedEmit, onChange, defaultChecked, defaultValue]
    );

    return (
      <Stack
        sx={{
          display: display,
          flexDirection: "row",
          gap: "0.5rem",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tooltip title={title}>
          <Box>
            <Switch
              disabled={false}
              size={"small"}
              {...props}
              onChange={handleChange}
              checked={localChecked}
              value={localValue}
            />
          </Box>
        </Tooltip>

        {label && <Box>{label}</Box>}
      </Stack>
    );
  }
);
