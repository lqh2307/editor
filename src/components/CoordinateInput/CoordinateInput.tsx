import { TextField, Tooltip, Button, Stack, Box } from "@mui/material";
import { convertDEGToDMS, convertDMSToDEG } from "../../utils/Utils";
import { AllInclusiveTwoTone } from "@mui/icons-material";
import { CoordinateInputProp } from "./Types";
import { DDMMSS } from "../../types/Common";
import { useDebounce } from "../../hooks";
import React from "react";

export const CoordinateInput = React.memo(
  ({
    display = "flex",
    title,
    icon,
    disabled,
    isLat,
    decimalLabel,
    degreeLabel,
    minuteLabel,
    secondLabel,
    toggleModeTitle,
    shrink = true,
    value,
    defaultValue = 0,
    delay = 200,
    onChange,
    slotProps,
    sx,
    forceDecimal,
    hideToggle,
    ...props
  }: CoordinateInputProp): React.JSX.Element => {
    const [isDec, setIsDec] = React.useState<boolean>(!!forceDecimal);
    const [dec, setDec] = React.useState<number>(Number(value ?? defaultValue));
    const [dms, setDms] = React.useState<DDMMSS>(
      convertDEGToDMS(Number(value ?? defaultValue))
    );

    React.useEffect(() => {
      const newVal: number = Number(value ?? defaultValue);

      setDec(newVal);
      setDms(convertDEGToDMS(newVal));
    }, [value, defaultValue]);

    React.useEffect(() => {
      if (isDec) {
        setDms(convertDEGToDMS(dec));
      } else {
        setDec(convertDMSToDEG(dms));
      }
    }, [isDec]);

    const [debouncedEmit] = useDebounce(
      (value: number) => {
        onChange?.(value);
      },
      delay,
      [onChange]
    );

    const handleDecimalChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const newVal: number = Number(e.target?.value ?? defaultValue);

        setDec(newVal);
        setDms(convertDEGToDMS(newVal));
        debouncedEmit(newVal);
      },
      [debouncedEmit, defaultValue]
    );

    const dmsChangeHandler = React.useMemo(
      () => ({
        degree: (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ): void => {
          const newDms: DDMMSS = {
            ...dms,
            degree: Number(e.target?.value ?? defaultValue),
          };
          const newVal: number = convertDMSToDEG(newDms);

          setDms(newDms);
          setDec(newVal);
          debouncedEmit(newVal);
        },
        minute: (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ): void => {
          const newDms: DDMMSS = {
            ...dms,
            minute: Number(e.target?.value ?? defaultValue),
          };
          const newVal: number = convertDMSToDEG(newDms);

          setDms(newDms);
          setDec(newVal);
          debouncedEmit(newVal);
        },
        second: (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ): void => {
          const newDms: DDMMSS = {
            ...dms,
            second: Number(e.target?.value ?? defaultValue),
          };
          const newVal: number = convertDMSToDEG(newDms);

          setDms(newDms);
          setDec(newVal);
          debouncedEmit(newVal);
        },
      }),
      [dms, debouncedEmit, defaultValue]
    );

    const handleDecimalBlur = React.useCallback((): void => {
      const fixed: DDMMSS = convertDEGToDMS(dec);
      const normalized: number = convertDMSToDEG(fixed);

      setDec(normalized);
      setDms(fixed);
      debouncedEmit(normalized);
    }, [dec, debouncedEmit]);

    const handleDmsBlur = React.useCallback((): void => {
      const normalized: number = convertDMSToDEG(dms);
      const fixed: DDMMSS = convertDEGToDMS(normalized);

      setDec(normalized);
      setDms(fixed);
      debouncedEmit(normalized);
    }, [dms, debouncedEmit]);

    const toggleMode = React.useCallback((): void => {
      if (forceDecimal) return;
      setIsDec((prev) => !prev);
    }, [forceDecimal]);

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

        {isDec ? (
          <TextField
            variant={"standard"}
            size={"small"}
            fullWidth={true}
            type={"number"}
            {...props}
            onChange={handleDecimalChange}
            onBlur={handleDecimalBlur}
            disabled={disabled}
            value={dec}
            label={decimalLabel}
            sx={{
              "& input": {
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
              htmlInput: {
                ...(slotProps?.htmlInput ?? {}),
                min: isLat ? -90 : -180,
                max: isLat ? 90 : 180,
                step: 1,
              },
            }}
          />
        ) : (
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.25rem",
              alignItems: "center",
              width: "100%",
            }}
          >
            <TextField
              variant={"standard"}
              fullWidth={true}
              size={"small"}
              type={"number"}
              {...props}
              onChange={dmsChangeHandler.degree}
              onBlur={handleDmsBlur}
              disabled={disabled}
              value={dms.degree}
              label={degreeLabel}
              sx={{
                "& input": {
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
                htmlInput: {
                  ...(slotProps?.htmlInput ?? {}),
                  min: isLat ? -90 : -180,
                  max: isLat ? 90 : 180,
                  step: 1,
                },
              }}
            />

            <TextField
              variant={"standard"}
              fullWidth={true}
              size={"small"}
              type={"number"}
              {...props}
              onChange={dmsChangeHandler.minute}
              onBlur={handleDmsBlur}
              disabled={disabled}
              value={dms.minute}
              label={minuteLabel}
              sx={{
                "& input": {
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
                htmlInput: {
                  ...(slotProps?.htmlInput ?? {}),
                  min: 0,
                  max: 60,
                  step: 1,
                },
              }}
            />

            <TextField
              variant={"standard"}
              fullWidth={true}
              size={"small"}
              type={"number"}
              onChange={dmsChangeHandler.second}
              onBlur={handleDmsBlur}
              {...props}
              disabled={disabled}
              value={dms.second}
              label={secondLabel}
              sx={{
                "& input": {
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
                htmlInput: {
                  ...(slotProps?.htmlInput ?? {}),
                  min: 0,
                  max: 60,
                  step: 1,
                },
              }}
            />
          </Stack>
        )}

        {hideToggle ? null : (
          <Tooltip title={toggleModeTitle}>
            <Box>
              <Button
                disabled={disabled || !!forceDecimal}
                fullWidth={true}
                variant={"outlined"}
                type={"button"}
                size={"small"}
                onClick={toggleMode}
                sx={{
                  minWidth: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AllInclusiveTwoTone fontSize="small" />
              </Button>
            </Box>
          </Tooltip>
        )}
      </Stack>
    );
  }
);
