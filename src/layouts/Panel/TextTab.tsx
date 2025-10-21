import { SelectInput, SelectInputOption } from "../../components/SelectInput";
import { useShapesContext, useStageContext } from "../../contexts";
import { useDebounceHotKey } from "../../hooks/useDebounceHotKey";
import { TooltipButton } from "../../components/TooltipButton";
import { NumberInput } from "../../components/NumberInput";
import { abortRequest } from "../../utils/Request";
import { TextFontFamily } from "../../types/Text";
import { useTranslation } from "react-i18next";
import { fixNumber } from "../../utils/Number";
import { getFonts } from "../../apis/font";
import { AxiosResponse } from "axios";
import { TabPanel } from "@mui/lab";
import { FontInfo } from "./Types";
import React from "react";
import {
  FormatStrikethroughTwoTone,
  VerticalAlignBottomTwoTone,
  VerticalAlignCenterTwoTone,
  FormatAlignCenterTwoTone,
  FormatAlignRightTwoTone,
  FormatUnderlinedTwoTone,
  VerticalAlignTopTwoTone,
  FormatAlignLeftTwoTone,
  FormatItalicTwoTone,
  FormatBoldTwoTone,
  ExpandMoreTwoTone,
} from "@mui/icons-material";
import {
  AccordionDetails,
  AccordionSummary,
  ButtonGroup,
  Typography,
  Accordion,
} from "@mui/material";

export const PanelTextTab = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { updateSnackbarAlert } = useStageContext();

  const { selectedShape, updateShape } = useShapesContext();

  const textHandler = React.useMemo(
    () => ({
      horizontalAlign: (value: string): void => {
        if (selectedShape.type === "text") {
          updateShape(
            {
              align: value,
            },
            true,
            true
          );
        }
      },
      verticalAlign: (value: string): void => {
        if (selectedShape.type === "text") {
          updateShape(
            {
              verticalAlign: value,
            },
            true,
            true
          );
        }
      },
      changeFontFamily: (value: string): void => {
        if (selectedShape.type === "text") {
          updateShape(
            {
              fontFamily: value,
            },
            true,
            true
          );
        }
      },
      changeFontSize: (value: string): void => {
        if (selectedShape.type === "text") {
          updateShape(
            {
              fontSize: fixNumber(value, false),
            },
            true,
            true
          );
        }
      },
    }),
    [updateShape, selectedShape.type]
  );

  const changeTextFontItalicHandler = React.useCallback((): void => {
    if (selectedShape.type === "text") {
      updateShape(
        {
          fontStyle: selectedShape.fontStyle === "normal" ? "italic" : "normal",
        },
        true,
        true
      );
    }
  }, [updateShape, selectedShape.type, selectedShape.fontStyle]);

  const changeTextFontBoldHandler = React.useCallback((): void => {
    if (selectedShape.type === "text") {
      updateShape(
        {
          fontWeight: selectedShape.fontWeight === "normal" ? "bold" : "normal",
        },
        true,
        true
      );
    }
  }, [updateShape, selectedShape.type, selectedShape.fontWeight]);

  const changeTextDecorationHandler = React.useMemo(
    () => ({
      lineThrough: (): void => {
        if (selectedShape.type === "text") {
          updateShape(
            {
              textDecoration:
                selectedShape.textDecoration !== "line-through"
                  ? "line-through"
                  : "",
            },
            true,
            true
          );
        }
      },
      underline: (): void => {
        if (selectedShape.type === "text") {
          updateShape(
            {
              textDecoration:
                selectedShape.textDecoration !== "underline" ? "underline" : "",
            },
            true,
            true
          );
        }
      },
    }),
    [updateShape, selectedShape.type, selectedShape.textDecoration]
  );

  const fontInitRef = React.useRef<FontInfo>({
    isLoading: false,
    fonts: [],
  });

  const [fontInfo, setFontInfo] = React.useState<FontInfo>(fontInitRef.current);

  const fetchFontControllerRef = React.useRef<AbortController>(undefined);

  const fetchFontHandler = React.useCallback(async (): Promise<void> => {
    if (fontInfo.fonts?.length) {
      return;
    }

    try {
      setFontInfo((prev) => ({
        ...prev,
        isLoading: true,
      }));

      // Cancel previous request
      fetchFontControllerRef.current = abortRequest(
        fetchFontControllerRef.current,
        true
      );

      const response: AxiosResponse = await getFonts({});

      setFontInfo({
        isLoading: false,
        fonts: (response.data as TextFontFamily[]).map((item) => ({
          title: item.name,
          value: item.name,
          menuItemProp: {
            sx: {
              fontFamily: item.name,
              fontSize: 12,
            },
          },
        })) as SelectInputOption[],
      });
    } catch (error) {
      setFontInfo(fontInitRef.current);

      updateSnackbarAlert(
        `${t("panel.text.common.snackBarAlert.error")} ${error}`,
        "error"
      );
    }
  }, [fontInfo.fonts, updateSnackbarAlert, t]);

  React.useEffect(() => {
    fetchFontHandler();
  }, []);

  useDebounceHotKey({
    keys: ["ctrl+b", "cmd+b"],
    callback: (e) => {
      e.preventDefault();

      changeTextFontBoldHandler();
    },
    deps: [changeTextFontBoldHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+i", "cmd+i"],
    callback: (e) => {
      e.preventDefault();

      changeTextFontItalicHandler();
    },
    deps: [changeTextFontItalicHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+u", "cmd+u"],
    callback: (e) => {
      e.preventDefault();

      changeTextDecorationHandler.underline();
    },
    deps: [changeTextDecorationHandler.underline],
  });

  useDebounceHotKey({
    keys: ["ctrl+t", "cmd+t"],
    callback: (e) => {
      e.preventDefault();

      changeTextDecorationHandler.lineThrough();
    },
    deps: [changeTextDecorationHandler.lineThrough],
  });

  useDebounceHotKey({
    keys: ["ctrl+l", "cmd+l"],
    callback: (e) => {
      e.preventDefault();

      textHandler.horizontalAlign("left");
    },
    deps: [textHandler.horizontalAlign],
  });

  useDebounceHotKey({
    keys: ["ctrl+e", "cmd+e"],
    callback: (e) => {
      e.preventDefault();

      textHandler.horizontalAlign("center");
    },
    deps: [textHandler.horizontalAlign],
  });

  useDebounceHotKey({
    keys: ["ctrl+r", "cmd+r"],
    callback: (e) => {
      e.preventDefault();

      textHandler.horizontalAlign("right");
    },
    deps: [textHandler.horizontalAlign],
  });

  useDebounceHotKey({
    keys: ["ctrl+shift+l", "cmd+shift+l"],
    callback: (e) => {
      e.preventDefault();

      textHandler.verticalAlign("top");
    },
    deps: [textHandler.verticalAlign],
  });

  useDebounceHotKey({
    keys: ["ctrl+shift+e", "cmd+shift+e"],
    callback: (e) => {
      e.preventDefault();

      textHandler.verticalAlign("middle");
    },
    deps: [textHandler.verticalAlign],
  });

  useDebounceHotKey({
    keys: ["ctrl+shift+r", "cmd+shift+r"],
    callback: (e) => {
      e.preventDefault();

      textHandler.verticalAlign("bottom");
    },
    deps: [textHandler.verticalAlign],
  });

  return (
    <TabPanel sx={{ width: "100%", paddingX: 0 }} value={"text"}>
      {/* Font */}
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.text.children.font.title")}
          </Typography>
        </AccordionSummary>

        {/* Font Family/Font Size */}
        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <SelectInput
            options={fontInfo.fonts}
            value={selectedShape.fontFamily}
            onChange={textHandler.changeFontFamily}
            label={t("panel.text.children.font.children.font.title")}
            sx={{
              "& .MuiSelect-select": {
                fontSize: 12,
                fontFamily: selectedShape.fontFamily,
              },
            }}
          />

          <NumberInput
            label={t("panel.text.children.font.children.size.title")}
            value={selectedShape.fontSize}
            onChange={textHandler.changeFontSize}
            min={1}
          />
        </AccordionDetails>
      </Accordion>

      {/* Format */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.text.children.format.title")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          {/* Bold/Italic/Underline/Strikethrough */}
          <ButtonGroup variant={"outlined"} size={"small"}>
            <TooltipButton
              icon={<FormatBoldTwoTone fontSize={"small"} />}
              title={t("panel.text.children.format.children.bold.title")}
              sx={{
                background: selectedShape.fontWeight === "bold" ? "grey" : "",
              }}
              value={selectedShape.fontWeight}
              onClick={changeTextFontBoldHandler}
            />

            <TooltipButton
              icon={<FormatItalicTwoTone fontSize={"small"} />}
              title={t("panel.text.children.format.children.italic.title")}
              sx={{
                background: selectedShape.fontStyle === "italic" ? "grey" : "",
              }}
              value={selectedShape.fontStyle}
              onClick={changeTextFontItalicHandler}
            />

            <TooltipButton
              icon={<FormatUnderlinedTwoTone fontSize={"small"} />}
              title={t("panel.text.children.format.children.underline.title")}
              sx={{
                background:
                  selectedShape.textDecoration === "underline" ? "grey" : "",
              }}
              value={selectedShape.textDecoration}
              onClick={changeTextDecorationHandler.underline}
            />

            <TooltipButton
              icon={<FormatStrikethroughTwoTone fontSize={"small"} />}
              title={t(
                "panel.text.children.format.children.strikethrough.title"
              )}
              sx={{
                background:
                  selectedShape.textDecoration === "line-through" ? "grey" : "",
              }}
              value={selectedShape.textDecoration}
              onClick={changeTextDecorationHandler.lineThrough}
            />
          </ButtonGroup>
        </AccordionDetails>
      </Accordion>

      {/* Align */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.text.children.align.title")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {/* Horizontal Left Align/Horizontal Center Align/Horizontal Right Align */}
          <ButtonGroup variant={"outlined"} size={"small"}>
            <TooltipButton
              icon={<FormatAlignLeftTwoTone fontSize={"small"} />}
              title={t("panel.text.children.align.children.left.title")}
              sx={{
                background: selectedShape.align === "left" ? "grey" : "",
              }}
              value={"left"}
              onClick={textHandler.horizontalAlign}
            />

            <TooltipButton
              icon={<FormatAlignCenterTwoTone fontSize={"small"} />}
              title={t("panel.text.children.align.children.center.title")}
              sx={{
                background: selectedShape.align === "center" ? "grey" : "",
              }}
              value={"center"}
              onClick={textHandler.horizontalAlign}
            />

            <TooltipButton
              icon={<FormatAlignRightTwoTone fontSize={"small"} />}
              title={t("panel.text.children.align.children.right.title")}
              sx={{
                background: selectedShape.align === "right" ? "grey" : "",
              }}
              value={"right"}
              onClick={textHandler.horizontalAlign}
            />
          </ButtonGroup>

          {/* Vertical Top Align/Vertical Middle Align/Vertical Bottom Align */}
          <ButtonGroup variant={"outlined"} size={"small"}>
            <TooltipButton
              icon={<VerticalAlignTopTwoTone fontSize={"small"} />}
              title={t("panel.text.children.align.children.top.title")}
              sx={{
                background: selectedShape.verticalAlign === "top" ? "grey" : "",
              }}
              value={"top"}
              onClick={textHandler.verticalAlign}
            />

            <TooltipButton
              icon={<VerticalAlignCenterTwoTone fontSize={"small"} />}
              title={t("panel.text.children.align.children.middle.title")}
              sx={{
                background:
                  selectedShape.verticalAlign === "middle" ? "grey" : "",
              }}
              value={"middle"}
              onClick={textHandler.verticalAlign}
            />

            <TooltipButton
              icon={<VerticalAlignBottomTwoTone fontSize={"small"} />}
              title={t("panel.text.children.align.children.bottom.title")}
              sx={{
                background:
                  selectedShape.verticalAlign === "bottom" ? "grey" : "",
              }}
              value={"bottom"}
              onClick={textHandler.verticalAlign}
            />
          </ButtonGroup>
        </AccordionDetails>
      </Accordion>
    </TabPanel>
  );
});
