import { Box, MenuItem, Stack, TextField, Tooltip } from "@mui/material";
import { SelectInputProp } from "./Types";
import { useDebounce } from "../../hooks";
import React from "react";

export const SelectInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    options,
    shrink = true,
    onChange,
    onOpen,
    delay = 200,
    value,
    defaultValue = "",
    slotProps,
    sx,
    ...props
  }: SelectInputProp): React.JSX.Element => {
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
          select={true}
          fullWidth={true}
          {...props}
          sx={{
            "& .MuiSelect-select": {
              fontSize: 12,
            },
            ...(sx ?? {}),
          }}
          slotProps={{
            ...(slotProps ?? {}),
            inputLabel: {
              ...((slotProps?.inputLabel as any) ?? {}),
              shrink: shrink,
            },
            select: {
              ...(slotProps?.select ?? {}),
              onOpen: onOpen,
            },
          }}
          onChange={handleChange}
          value={localValue}
        >
          {options.map((item) => (
            <MenuItem
              disableRipple={true}
              disableTouchRipple={true}
              key={item.value}
              value={item.value}
              {...(item.menuItemProp ?? {})}
              sx={{
                fontSize: 12,
                ...(item.menuItemProp?.sx ?? {}),
              }}
            >
              {item.title}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    );
  }
);
