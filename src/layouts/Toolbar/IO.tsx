import { SelectInput, SelectInputOption } from "../../components/SelectInput";
import { base64ToBlob, blobToString, stringToBlob } from "../../utils/Image";
import { downloadFile, updateFile, uploadFile } from "../../apis/file";
import { ImportFileButton } from "../../components/ImportFileButton";
import { renderHighQualityPDF, renderPDF } from "../../apis/render";
import { useShapesContext, useStageContext } from "../../contexts";
import { TooltipCheckbox } from "../../components/TooltipCheckbox";
import { useDebounceHotKey } from "../../hooks/useDebounceHotKey";
import translation from "../../locales/english/translation.json";
import { TooltipButton } from "../../components/TooltipButton";
import { TooltipSwitch } from "../../components/TooltipSwitch";
import { LoadingImage } from "../../components/LoadingImage";
import { PopperButton } from "../../components/PopperButton";
import { NumberInput } from "../../components/NumberInput";
import { BasicDialog } from "../../components/BasicDialog";
import { KonvaShape } from "../../components/KonvaShape";
import { TextInput } from "../../components/TextInput";
import { BASE_URL, importSchema } from "../../configs";
import { validateJSON } from "../../utils/Validator";
import { abortRequest } from "../../utils/Request";
import { Format, Size } from "../../types/Common";
import { useTranslation } from "react-i18next";
import { fixNumber } from "../../utils/Number";
import { AxiosResponse } from "axios";
import { nanoid } from "nanoid";
import React from "react";
import {
  parseStringToType,
  createReport,
  searchReport,
  getReport,
  Report,
} from "../../apis/report";
import {
  AutoAwesomeTwoTone,
  KeyboardArrowRight,
  KeyboardArrowLeft,
  ExpandMoreTwoTone,
  DownloadTwoTone,
  DevicesTwoTone,
  UploadTwoTone,
  CloseTwoTone,
  CloudTwoTone,
  SaveTwoTone,
} from "@mui/icons-material";
import {
  detectContentTypeFromFormat,
  calculatePaperSize,
  saveFileFromBase64,
} from "../../utils/Utils";
import {
  HorizontalAlign,
  VerticalAlign,
  Orientation,
  Fit,
} from "../../types/Window";
import {
  AccordionDetails,
  AccordionSummary,
  MobileStepper,
  ButtonGroup,
  Typography,
  Accordion,
  Divider,
  Stack,
  Paper,
  Grid,
  Box,
} from "@mui/material";

type ExportInfoState = {
  name: string;
  format: Format;

  isOpen: boolean;

  previewActive: number;
  extractedPreviewImages: string[];
  previewImages: string[];
  isPreviewLoading: boolean;
  isExportLoading: boolean;

  grayscale: boolean;
  highQuality: boolean;
  crop: boolean;

  size: string;
  orientation: Orientation;
  width: number;
  height: number;
  horizontalAlign: HorizontalAlign;
  verticalAlign: VerticalAlign;

  pagination: boolean;
  horizontalPagination: HorizontalAlign;
  verticalPagination: VerticalAlign;

  fit: Fit;
  row: number;
  column: number;
  marginX: number;
  marginY: number;
  gapX: number;
  gapY: number;
};

type CloudInfo = {
  isLoading: boolean;
  isOpen: boolean;
  name: string;
  type: string;
};

export const ToolbarIO = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { fitStageScreen, exportStage, updateSnackbarAlert } =
    useStageContext();

  const { shapeList, addShapes, exportShapes, clean, updateSelectedIds } =
    useShapesContext();

  // Reports
  const reportInitRef = React.useRef<SelectInputOption[]>([]);

  const [reports, setReports] = React.useState<SelectInputOption[]>(
    reportInitRef.current
  );

  const fetchReportControllerRef = React.useRef<AbortController>(undefined);

  const fetchReportHandler = React.useCallback(async (): Promise<void> => {
    try {
      // Cancel previous request
      fetchReportControllerRef.current = abortRequest(
        fetchReportControllerRef.current,
        true
      );

      // Call API to search report
      const response: AxiosResponse = await searchReport({
        controller: fetchReportControllerRef.current,
        desc: true,
        type: 1,
      });

      setReports(
        (response.data as Report[]).map((item) => ({
          title: item.name,
          value: item.id,
        }))
      );
    } catch (error) {
      setReports(reportInitRef.current);

      updateSnackbarAlert(
        `${t("toolBar.import.common.snackBarAlert.error")} ${error}`,
        "error"
      );
    }
  }, [updateSnackbarAlert, t]);

  const reportInfoRef = React.useRef<Report>(undefined);

  const initRef = React.useRef<CloudInfo>({
    isLoading: false,
    isOpen: false,
    name: undefined,
    type: "report",
  });

  const [saveInfo, setSaveInfo] = React.useState<CloudInfo>(initRef.current);

  const toCloudHandler = React.useMemo(() => {
    return {
      close: (): void => {
        setSaveInfo(initRef.current);
      },
      onClose: (_: any, reason: "backdropClick" | "escapeKeyDown"): void => {
        if (reason === "backdropClick") {
          return;
        }

        setSaveInfo(initRef.current);
      },
      changeName: (value: string): void => {
        setSaveInfo((prev) => ({
          ...prev,
          name: value,
        }));
      },
      changeType: (value: string): void => {
        setSaveInfo((prev) => ({
          ...prev,
          type: value,
        }));
      },
      autoGenerateName: (): void => {
        setSaveInfo((prev) => ({
          ...prev,
          name: nanoid(),
        }));
      },
    };
  }, []);

  const openSaveToCloudHandler = React.useCallback((): void => {
    updateSelectedIds({}, true);

    fitStageScreen(true);

    setSaveInfo({
      ...initRef.current,
      isOpen: true,
    });
  }, [fitStageScreen, updateSelectedIds]);

  const saveHandler = React.useCallback(async (): Promise<void> => {
    if (!reportInfoRef.current) {
      openSaveToCloudHandler();
    } else {
      try {
        setSaveInfo((prev) => ({
          ...prev,
          isLoading: true,
        }));

        // Call API to upload file
        await updateFile({
          id: reportInfoRef.current.json_file_id,
          blob: stringToBlob(await exportShapes(false), "json"),
          fileName: `${reportInfoRef.current.name}.json`,
          format: "json",
        });

        // Clean
        clean();

        updateSnackbarAlert(
          t("toolBar.save.common.snackBarAlert.save"),
          "success"
        );
      } catch (error) {
        updateSnackbarAlert(
          `${t("toolBar.save.common.snackBarAlert.error")} ${error}`,
          "error"
        );
      } finally {
        toCloudHandler.close();
      }
    }
  }, [exportShapes, openSaveToCloudHandler, clean, updateSnackbarAlert, t]);

  const saveToCloudHandler = React.useCallback(async (): Promise<void> => {
    try {
      openSaveToCloudHandler();

      let imageFileResponse: AxiosResponse;

      // Call API to upload file
      const jsonFileResponse: AxiosResponse = await uploadFile({
        blob: stringToBlob(await exportShapes(false), "json"),
        fileName: `${saveInfo.name}.json`,
        format: "json",
      });

      // Call API to upload fiel
      if (saveInfo.type !== "report") {
        imageFileResponse = await uploadFile({
          blob: base64ToBlob(exportStage("png", true), "png"),
          fileName: `${saveInfo.name}.png`,
          format: "png",
        });
      }

      // Call API to create report
      const reportResponse: AxiosResponse = await createReport({
        name: saveInfo.name,
        json_file_id: jsonFileResponse.data.id,
        image_file_id: imageFileResponse?.data.id,
        type: parseStringToType(saveInfo.type),
      });

      // Store report info
      reportInfoRef.current = reportResponse.data;

      // Clean
      clean();

      updateSnackbarAlert(
        t("toolBar.save.common.snackBarAlert.save"),
        "success"
      );
    } catch (error) {
      updateSnackbarAlert(
        `${t("toolBar.save.common.snackBarAlert.error")} ${error}`,
        "error"
      );
    } finally {
      toCloudHandler.close();
    }
  }, [
    saveInfo,
    exportShapes,
    exportStage,
    openSaveToCloudHandler,
    clean,
    updateSnackbarAlert,
    t,
  ]);

  const [importInfo, setImportInfo] = React.useState<CloudInfo>(
    initRef.current
  );

  const fromCloudHandler = React.useMemo(() => {
    return {
      open: (): void => {
        setImportInfo({
          ...initRef.current,
          isOpen: true,
        });
      },
      close: (): void => {
        setImportInfo(initRef.current);
      },
      onClose: (_: any, reason: "backdropClick" | "escapeKeyDown"): void => {
        if (reason === "backdropClick") {
          return;
        }

        setImportInfo(initRef.current);
      },
      changeName: (value: string): void => {
        setImportInfo((prev) => ({
          ...prev,
          name: value,
        }));
      },
    };
  }, []);

  const importFromCloudHandler = React.useCallback(async (): Promise<void> => {
    try {
      fromCloudHandler.open();

      // Call API go get report
      const reportResponse: AxiosResponse = await getReport({
        id: importInfo.name,
      });

      // Call API to download file
      const fileResponse: AxiosResponse = await downloadFile({
        id: reportResponse.data.json_file_id,
        responseType: "json",
      });

      // Store report info
      reportInfoRef.current = reportResponse.data;

      // Addd shapes
      await addShapes(fileResponse.data as KonvaShape[], true, true, undefined);

      updateSnackbarAlert(
        t("toolBar.import.common.snackBarAlert.import"),
        "success"
      );
    } catch (error) {
      updateSnackbarAlert(
        `${t("toolBar.import.common.snackBarAlert.error")} ${error}`,
        "error"
      );
    } finally {
      fromCloudHandler.close();
    }
  }, [addShapes, importInfo, updateSnackbarAlert, t]);

  const importFromDeviceHandler = React.useCallback(
    async (file: File): Promise<void> => {
      try {
        const shapes: KonvaShape[] = JSON.parse(
          await blobToString(file)
        ) as KonvaShape[];

        validateJSON(importSchema, shapes);

        // Add shapes
        await addShapes(shapes, true, true, undefined);

        updateSnackbarAlert(
          t("toolBar.import.common.snackBarAlert.import"),
          "success"
        );
      } catch (error) {
        updateSnackbarAlert(
          `${t("toolBar.import.common.snackBarAlert.error")} ${error}`,
          "error"
        );
      }
    },
    [addShapes, updateSnackbarAlert, t]
  );

  const data: Record<string, SelectInputOption[]> = React.useMemo<
    Record<string, SelectInputOption[]>
  >(
    () => ({
      types: Object.keys(translation.toolBar.save.common.type).map((item) => ({
        title: t(`toolBar.save.common.type.${item}`),
        value: item,
      })),
      formats: Object.keys(translation.toolBar.export.common.formats).map(
        (item) => ({
          title: t(`toolBar.export.common.formats.${item}`),
          value: item,
        })
      ),
      sizes: Object.keys(translation.toolBar.export.common.sizes).map(
        (item) => ({
          title: t(`toolBar.export.common.sizes.${item}`),
          value: item,
        })
      ),
      orientations: Object.keys(
        translation.toolBar.export.common.orientations
      ).map((item) => ({
        title: t(`toolBar.export.common.orientations.${item}`),
        value: item,
      })),
      fits: Object.keys(translation.toolBar.export.common.fits).map((item) => ({
        title: t(`toolBar.export.common.fits.${item}`),
        value: item,
      })),
      horizontalAligns: Object.keys(
        translation.toolBar.export.common.horizontalAligns
      ).map((item) => ({
        title: t(`toolBar.export.common.horizontalAligns.${item}`),
        value: item,
      })),
      verticalAligns: Object.keys(
        translation.toolBar.export.common.verticalAligns
      ).map((item) => ({
        title: t(`toolBar.export.common.verticalAligns.${item}`),
        value: item,
      })),
    }),
    [t]
  );

  // Store setting initial state
  const settingInitRef = React.useRef<ExportInfoState>({
    name: undefined,
    format: "png" as Format,

    isOpen: false,

    previewActive: 0,
    previewImages: [],
    extractedPreviewImages: [],
    isPreviewLoading: false,
    isExportLoading: false,

    size: "a4",
    orientation: "portrait" as Orientation,
    ...calculatePaperSize("a4"),
    horizontalAlign: "center" as HorizontalAlign,
    verticalAlign: "middle" as VerticalAlign,

    fit: "contain" as Fit,
    row: 1,
    column: 1,
    marginX: 0,
    marginY: 0,
    gapX: 0,
    gapY: 0,

    pagination: false,
    horizontalPagination: "right" as HorizontalAlign,
    verticalPagination: "bottom" as VerticalAlign,

    crop: false,
    highQuality: false,
    grayscale: false,
  });

  const resolutionRef = React.useRef<Size>(undefined);

  const [exportInfo, setExportInfo] = React.useState<ExportInfoState>(
    settingInitRef.current
  );

  const settingHandler = React.useMemo(
    () => ({
      onClose: (_: any, reason: "backdropClick" | "escapeKeyDown"): void => {
        if (reason === "backdropClick") {
          return;
        }

        setExportInfo(settingInitRef.current);

        resolutionRef.current = undefined;
      },
      close: (): void => {
        setExportInfo(settingInitRef.current);

        resolutionRef.current = undefined;
      },
      changeName: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          name: value,
        }));
      },
      autoGenerateName: (): void => {
        setExportInfo((prev) => ({
          ...prev,
          name: nanoid(),
        }));
      },
      changeFormat: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          format: value as Format,
        }));
      },
      changeSize: (value: string): void => {
        setExportInfo((prev) => {
          if (exportInfo.size === "custom") {
            return {
              ...prev,
              size: value,
            };
          } else {
            return {
              ...prev,
              size: value,
              ...calculatePaperSize(value),
            };
          }
        });
      },
      changeOrientation: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          orientation: value as Orientation,
        }));
      },
      changeWidth: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          width: fixNumber(value, true),
        }));
      },
      changeHeight: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          height: fixNumber(value, true),
        }));
      },
      changeFit: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          fit: value as Fit,
        }));
      },
      changeHorizontalAlign: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          horizontalAlign: value as HorizontalAlign,
        }));
      },
      changeVerticalAlign: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          verticalAlign: value as VerticalAlign,
        }));
      },
      changePagination: (checked: boolean): void => {
        setExportInfo((prev) => ({
          ...prev,
          pagination: checked,
        }));
      },
      changeHorizontalPagination: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          horizontalPagination: value as HorizontalAlign,
        }));
      },
      changeVerticalPagination: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          verticalPagination: value as VerticalAlign,
        }));
      },
      changeHighQuality: (checked: boolean): void => {
        setExportInfo((prev) => ({
          ...prev,
          highQuality: checked,
        }));
      },
      changeRow: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          row: fixNumber(value, true),
        }));
      },
      changeColumn: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          column: fixNumber(value, true),
        }));
      },
      changeMarginX: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          marginX: fixNumber(value, true),
        }));
      },
      changeMarginY: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          marginY: fixNumber(value, true),
        }));
      },
      changeGapX: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          gapX: fixNumber(value, true),
        }));
      },
      changeGapY: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          gapY: fixNumber(value, true),
        }));
      },
      changeGrayscale: (checked: boolean): void => {
        setExportInfo((prev) => ({
          ...prev,
          grayscale: checked,
        }));
      },
      changeCrop: (checked: boolean): void => {
        setExportInfo((prev) => ({
          ...prev,
          crop: checked,
        }));
      },
      changePreviewActive: (value: string): void => {
        setExportInfo((prev) => ({
          ...prev,
          previewActive: !!value
            ? prev.previewActive - 1
            : prev.previewActive + 1,
        }));
      },
    }),
    []
  );

  const openSettingHandler = React.useCallback((): void => {
    updateSelectedIds({}, true);

    fitStageScreen(true);

    setExportInfo({
      ...settingInitRef.current,
      isOpen: true,
    });

    shapeList.forEach((item) => {
      if (item.type === "image" && item.resolution) {
        if (resolutionRef.current) {
          if (item.resolution[0] < resolutionRef.current[0]) {
            resolutionRef.current[0] = item.resolution[0];
          }

          if (item.resolution[1] < resolutionRef.current[1]) {
            resolutionRef.current[1] = item.resolution[1];
          }
        } else {
          resolutionRef.current = [item.resolution[0], item.resolution[1]];
        }
      }
    });
  }, [fitStageScreen, shapeList, updateSelectedIds]);

  const renderPreviewControllerRef = React.useRef<AbortController>(undefined);

  async function renderPreview(): Promise<void> {
    // Validate
    if (!exportInfo.isOpen) {
      return;
    }

    if (exportInfo.format === "pdf") {
      if (
        exportInfo.width <= 0 ||
        exportInfo.height <= 0 ||
        (!exportInfo.highQuality &&
          (exportInfo.row <= 0 ||
            exportInfo.column <= 0 ||
            exportInfo.marginX < 0 ||
            exportInfo.marginY < 0 ||
            exportInfo.gapX < 0 ||
            exportInfo.gapY))
      ) {
        return;
      }
    }

    let extractedPreviewImages: string[] = [];
    let previewImages: string[] = [];

    try {
      setExportInfo((prev) => ({
        ...prev,
        previewActive: 0,
        extractedPreviewImages: extractedPreviewImages,
        previewImages: previewImages,
        isPreviewLoading: true,
      }));

      if (exportInfo.format === "pdf") {
        // Cancel previous request
        renderPreviewControllerRef.current = abortRequest(
          renderPreviewControllerRef.current,
          true
        );

        const tmpPreviewImages: string[] = [
          exportStage("png", exportInfo.crop),
        ];

        // Call API to render PDF
        const response: AxiosResponse = exportInfo.highQuality
          ? await renderHighQualityPDF({
              controller: renderPreviewControllerRef.current,
              input: {
                images: [
                  {
                    image: tmpPreviewImages[0],
                    resolution: resolutionRef.current,
                  },
                ],
              },
              preview: {
                format: "png",
              },
              output: {
                alignContent: {
                  horizontal: exportInfo.horizontalAlign,
                  vertical: exportInfo.verticalAlign,
                },
                base64: true,
                paperSize: [exportInfo.width, exportInfo.height],
                orientation: exportInfo.orientation,
                grayscale: exportInfo.grayscale,
              },
            })
          : await renderPDF({
              controller: renderPreviewControllerRef.current,
              input: {
                images: tmpPreviewImages,
              },
              preview: {
                format: "png",
              },
              output: {
                alignContent: {
                  horizontal: exportInfo.horizontalAlign,
                  vertical: exportInfo.verticalAlign,
                },
                base64: true,
                paperSize: [exportInfo.width, exportInfo.height],
                orientation: exportInfo.orientation,
                fit: exportInfo.fit,
                grid: {
                  row: exportInfo.row,
                  column: exportInfo.column,
                  marginX: exportInfo.marginX,
                  marginY: exportInfo.marginY,
                  gapX: exportInfo.gapX,
                  gapY: exportInfo.gapY,
                },
                grayscale: exportInfo.grayscale,
                pagination: exportInfo.pagination
                  ? {
                      horizontal: exportInfo.horizontalPagination,
                      vertical: exportInfo.verticalPagination,
                    }
                  : undefined,
              },
            });

        extractedPreviewImages = tmpPreviewImages;
        previewImages = response.data as string[];
      } else {
        extractedPreviewImages = [exportStage("png", exportInfo.crop)];
        previewImages = extractedPreviewImages;
      }
    } catch (error) {
      updateSnackbarAlert(
        `${t("toolBar.export.common.snackBarAlert.error")} ${error}`,
        "error"
      );
    } finally {
      setExportInfo((prev) => ({
        ...prev,
        previewImages: previewImages,
        extractedPreviewImages: extractedPreviewImages,
        isPreviewLoading: false,
      }));
    }
  }

  const exportHandler = React.useCallback(async (): Promise<void> => {
    try {
      setExportInfo((prev) => ({
        ...prev,
        isExportLoading: true,
      }));

      if (exportInfo.format === "pdf") {
        // Call API to render PDF
        const response: AxiosResponse = exportInfo.highQuality
          ? await renderHighQualityPDF({
              input: {
                images: [
                  {
                    image: exportInfo.extractedPreviewImages[0],
                    resolution: resolutionRef.current,
                  },
                ],
              },
              output: {
                alignContent: {
                  horizontal: exportInfo.horizontalAlign,
                  vertical: exportInfo.verticalAlign,
                },
                base64: true,
                paperSize: [exportInfo.width, exportInfo.height],
                orientation: exportInfo.orientation,
                grayscale: exportInfo.grayscale,
              },
            })
          : await renderPDF({
              input: {
                images: exportInfo.extractedPreviewImages,
              },
              output: {
                alignContent: {
                  horizontal: exportInfo.horizontalAlign,
                  vertical: exportInfo.verticalAlign,
                },
                base64: true,
                paperSize: [exportInfo.width, exportInfo.height],
                orientation: exportInfo.orientation,
                fit: exportInfo.fit,
                grid: {
                  row: exportInfo.row,
                  column: exportInfo.column,
                  marginX: exportInfo.marginX,
                  marginY: exportInfo.marginY,
                  gapX: exportInfo.gapX,
                  gapY: exportInfo.gapY,
                },
                grayscale: exportInfo.grayscale,
                pagination: exportInfo.pagination
                  ? {
                      horizontal: exportInfo.horizontalPagination,
                      vertical: exportInfo.verticalPagination,
                    }
                  : undefined,
              },
            });

        // Save
        saveFileFromBase64(
          response.data as string,
          `${exportInfo.name}.pdf`,
          detectContentTypeFromFormat("pdf")
        );
      } else if (exportInfo.format === "json") {
        await exportShapes(true, `${exportInfo.name}.json`);
      } else {
        saveFileFromBase64(
          exportInfo.extractedPreviewImages[0],
          `${exportInfo.name}.png`,
          detectContentTypeFromFormat("png")
        );
      }

      updateSnackbarAlert(
        t("toolBar.export.common.snackBarAlert.export"),
        "success"
      );
    } catch (error) {
      updateSnackbarAlert(
        `${t("toolBar.export.common.snackBarAlert.error")} ${error}`,
        "error"
      );
    } finally {
      setExportInfo((prev) => ({
        ...prev,
        isExportLoading: false,
      }));
    }
  }, [exportInfo, exportShapes, updateSnackbarAlert, t]);

  // Update preview
  React.useEffect(() => {
    renderPreview();
  }, [
    exportInfo.isOpen,
    exportInfo.format,
    exportInfo.orientation,
    exportInfo.width,
    exportInfo.height,
    exportInfo.horizontalAlign,
    exportInfo.verticalAlign,
    exportInfo.fit,
    exportInfo.row,
    exportInfo.column,
    exportInfo.marginX,
    exportInfo.marginY,
    exportInfo.gapX,
    exportInfo.gapY,
    exportInfo.pagination,
    exportInfo.horizontalPagination,
    exportInfo.verticalPagination,
    exportInfo.crop,
    exportInfo.highQuality,
    exportInfo.grayscale,
  ]);

  const previewImageNum: number = exportInfo.previewImages?.length ?? 0;

  const exportDialogTitle: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {t("toolBar.export.title")}

          <TooltipButton
            title={t("toolBar.export.common.button.close")}
            onClick={settingHandler.close}
            icon={<CloseTwoTone fontSize="small" />}
            color={"error"}
          />
        </Box>
      );
    }, [t]);

  const exportDialogContent: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <Grid
          container={true}
          columns={12}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          spacing={1}
          height={"44rem"}
        >
          <Grid
            size={3}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflowY: "auto",
            }}
          >
            {/* Setting */}
            <Divider
              sx={{
                fontSize: 12,
                textTransform: "uppercase",
                height: "3%",
              }}
            >
              {t("toolBar.export.children.setting.title")}
            </Divider>

            {/* General (Name/Format) */}
            <Accordion defaultExpanded={true}>
              <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
                <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                  {t("toolBar.export.children.setting.children.general.title")}
                </Typography>
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <TextInput
                    label={t(
                      "toolBar.export.children.setting.children.general.children.name.title"
                    )}
                    value={exportInfo.name}
                    onChange={settingHandler.changeName}
                    required={true}
                  />

                  <TooltipButton
                    icon={<AutoAwesomeTwoTone fontSize="small" />}
                    onClick={settingHandler.autoGenerateName}
                    disabled={exportInfo.isExportLoading}
                    title={t("toolBar.export.common.button.autoGenerate")}
                  />
                </Stack>

                <SelectInput
                  label={t(
                    "toolBar.export.children.setting.children.general.children.format.title"
                  )}
                  value={exportInfo.format}
                  onChange={settingHandler.changeFormat}
                  options={data.formats}
                />
              </AccordionDetails>
            </Accordion>

            {/* Paper (Size/Width/Height/Orientation) */}
            <Accordion
              sx={{
                display: exportInfo.format === "pdf" ? "flex" : "none",
                flexDirection: "column",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
                <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                  {t("toolBar.export.children.setting.children.paper.title")}
                </Typography>
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <SelectInput
                    label={t(
                      "toolBar.export.children.setting.children.paper.children.size.title"
                    )}
                    value={exportInfo.size}
                    onChange={settingHandler.changeSize}
                    options={data.sizes}
                  />

                  <SelectInput
                    label={t(
                      "toolBar.export.children.setting.children.paper.children.orientation.title"
                    )}
                    value={exportInfo.orientation}
                    onChange={settingHandler.changeOrientation}
                    options={data.orientations}
                  />
                </Stack>

                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <NumberInput
                    label={t(
                      "toolBar.export.children.setting.children.paper.children.width.title"
                    )}
                    value={exportInfo.width}
                    onChange={settingHandler.changeWidth}
                    disabled={exportInfo.size !== "custom"}
                  />

                  <NumberInput
                    label={t(
                      "toolBar.export.children.setting.children.paper.children.height.title"
                    )}
                    value={exportInfo.height}
                    onChange={settingHandler.changeHeight}
                    disabled={exportInfo.size !== "custom"}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Align Content (Horizontal/Vertical/Fit/Row/Column/MarginX/MarginY/GapX/GapY) */}
            <Accordion
              sx={{
                display: exportInfo.format === "pdf" ? "flex" : "none",
                flexDirection: "column",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
                <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                  {t(
                    "toolBar.export.children.setting.children.alignContent.title"
                  )}
                </Typography>
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <SelectInput
                    label={t(
                      "toolBar.export.children.setting.children.alignContent.children.horizontal.title"
                    )}
                    value={exportInfo.horizontalAlign}
                    onChange={settingHandler.changeHorizontalAlign}
                    options={data.horizontalAligns}
                  />

                  <SelectInput
                    label={t(
                      "toolBar.export.children.setting.children.alignContent.children.vertical.title"
                    )}
                    value={exportInfo.verticalAlign}
                    onChange={settingHandler.changeVerticalAlign}
                    options={data.verticalAligns}
                  />
                </Stack>

                <Stack
                  sx={{
                    display: exportInfo.highQuality ? "none" : "flex",
                    flexDirection: "row",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <SelectInput
                    label={t(
                      "toolBar.export.children.setting.children.alignContent.children.fit.title"
                    )}
                    value={exportInfo.fit}
                    onChange={settingHandler.changeFit}
                    options={data.fits}
                  />

                  <NumberInput
                    label={t(
                      "toolBar.export.children.setting.children.alignContent.children.row.title"
                    )}
                    min={1}
                    value={exportInfo.row}
                    onChange={settingHandler.changeRow}
                  />

                  <NumberInput
                    label={t(
                      "toolBar.export.children.setting.children.alignContent.children.column.title"
                    )}
                    min={1}
                    value={exportInfo.column}
                    onChange={settingHandler.changeColumn}
                  />
                </Stack>

                <Stack
                  sx={{
                    display: exportInfo.highQuality ? "none" : "flex",
                    flexDirection: "row",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <NumberInput
                    label={t(
                      "toolBar.export.children.setting.children.alignContent.children.marginX.title"
                    )}
                    value={exportInfo.marginX}
                    onChange={settingHandler.changeMarginX}
                  />

                  <NumberInput
                    label={t(
                      "toolBar.export.children.setting.children.alignContent.children.marginY.title"
                    )}
                    value={exportInfo.marginY}
                    onChange={settingHandler.changeMarginY}
                  />

                  <NumberInput
                    label={t(
                      "toolBar.export.children.setting.children.alignContent.children.gapX.title"
                    )}
                    value={exportInfo.gapX}
                    onChange={settingHandler.changeGapX}
                  />

                  <NumberInput
                    label={t(
                      "toolBar.export.children.setting.children.alignContent.children.gapY.title"
                    )}
                    value={exportInfo.gapY}
                    onChange={settingHandler.changeGapY}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Pagination (Enabled/Horizontal/Vertical) */}
            <Accordion
              sx={{
                display:
                  exportInfo.format === "pdf" && !exportInfo.highQuality
                    ? "flex"
                    : "none",
                flexDirection: "column",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
                <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                  {t(
                    "toolBar.export.children.setting.children.pagination.title"
                  )}
                </Typography>
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <TooltipSwitch
                    label={
                      <Typography fontSize={12}>
                        {t(
                          "toolBar.export.children.setting.children.pagination.children.enabled.title"
                        )}
                      </Typography>
                    }
                    title={t(
                      "toolBar.export.children.setting.children.pagination.children.enabled.title"
                    )}
                    checked={exportInfo.pagination}
                    onChange={settingHandler.changePagination}
                  />

                  <SelectInput
                    label={t(
                      "toolBar.export.children.setting.children.pagination.children.horizontal.title"
                    )}
                    value={exportInfo.horizontalPagination}
                    onChange={settingHandler.changeHorizontalPagination}
                    options={data.horizontalAligns}
                    disabled={!exportInfo.pagination}
                  />

                  <SelectInput
                    label={t(
                      "toolBar.export.children.setting.children.pagination.children.vertical.title"
                    )}
                    value={exportInfo.verticalPagination}
                    onChange={settingHandler.changeVerticalPagination}
                    options={data.verticalAligns}
                    disabled={!exportInfo.pagination}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Advanced (Crop/High Quality/Grayscale) */}
            <Accordion
              sx={{
                display: exportInfo.format !== "json" ? "flex" : "none",
                flexDirection: "column",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
                <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                  {t("toolBar.export.children.setting.children.advanced.title")}
                </Typography>
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <TooltipCheckbox
                    label={
                      <Typography fontSize={12}>
                        {t(
                          "toolBar.export.children.setting.children.advanced.children.crop.title"
                        )}
                      </Typography>
                    }
                    title={t(
                      "toolBar.export.children.setting.children.advanced.children.crop.title"
                    )}
                    checked={exportInfo.crop}
                    onChange={settingHandler.changeCrop}
                  />

                  <TooltipCheckbox
                    display={exportInfo.format === "pdf" ? "flex" : "none"}
                    label={
                      <Typography fontSize={12}>
                        {t(
                          "toolBar.export.children.setting.children.advanced.children.highQuality.title"
                        )}
                      </Typography>
                    }
                    title={t(
                      "toolBar.export.children.setting.children.advanced.children.highQuality.title"
                    )}
                    checked={exportInfo.highQuality}
                    onChange={settingHandler.changeHighQuality}
                  />
                </Stack>

                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <TooltipCheckbox
                    display={exportInfo.format === "pdf" ? "flex" : "none"}
                    label={
                      <Typography fontSize={12}>
                        {t(
                          "toolBar.export.children.setting.children.advanced.children.grayscale.title"
                        )}
                      </Typography>
                    }
                    title={t(
                      "toolBar.export.children.setting.children.advanced.children.grayscale.title"
                    )}
                    checked={exportInfo.grayscale}
                    onChange={settingHandler.changeGrayscale}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid
            size={9}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              paddingX: "4rem",
            }}
          >
            {/* Preview */}
            <Divider
              sx={{
                fontSize: 12,
                textTransform: "uppercase",
                height: "3%",
              }}
            >
              {t("toolBar.export.children.preview.title")}
            </Divider>

            {/* Image */}
            <LoadingImage
              alt={t("toolBar.export.children.preview.title")}
              src={
                previewImageNum
                  ? exportInfo.previewImages[exportInfo.previewActive]
                  : undefined
              }
              sx={{
                border: 1,
                width: "auto%",
                height: "92%",
              }}
              fallbackSrc={`${BASE_URL}/assets/images/placeholder.png`}
              isLoading={exportInfo.isPreviewLoading}
            />

            {/* Step */}
            <MobileStepper
              sx={{
                display:
                  exportInfo.format === "pdf" && previewImageNum
                    ? "flex"
                    : "none",
                paddingX: "24rem",
                height: "5%",
              }}
              variant={"text"}
              steps={previewImageNum}
              position={"static"}
              activeStep={exportInfo.previewActive}
              backButton={
                <TooltipButton
                  icon={<KeyboardArrowLeft fontSize="small" />}
                  title={t("toolBar.export.common.button.back")}
                  onClick={settingHandler.changePreviewActive}
                  variant={"text"}
                  value={"back"}
                  disabled={!previewImageNum || exportInfo.previewActive === 0}
                />
              }
              nextButton={
                <TooltipButton
                  icon={<KeyboardArrowRight fontSize="small" />}
                  title={t("toolBar.export.common.button.next")}
                  onClick={settingHandler.changePreviewActive}
                  variant={"text"}
                  disabled={
                    !previewImageNum ||
                    exportInfo.previewActive === previewImageNum - 1
                  }
                />
              }
            />
          </Grid>
        </Grid>
      );
    }, [exportInfo, data]);

  const exportDialogAction: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <TooltipButton
          title={t("toolBar.export.common.button.export")}
          onClick={exportHandler}
          isLoading={exportInfo.isExportLoading}
          disabled={
            !exportInfo.name ||
            exportInfo.isExportLoading ||
            exportInfo.isPreviewLoading ||
            !previewImageNum
          }
        >
          {t("toolBar.export.common.button.export")}
        </TooltipButton>
      );
    }, [exportHandler]);

  const saveToCloudDialogTitle: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {t("toolBar.save.children.toCloud.title")}

          <TooltipButton
            title={t("toolBar.save.common.button.close")}
            onClick={toCloudHandler.close}
            icon={<CloseTwoTone fontSize="small" />}
            color={"error"}
          />
        </Box>
      );
    }, [t]);

  const saveToCloudDialogContent: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Divider />

          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <TextInput
              label={t("toolBar.save.children.toCloud.children.name.title")}
              value={saveInfo.name}
              onChange={toCloudHandler.changeName}
              required={true}
            />

            <TooltipButton
              icon={<AutoAwesomeTwoTone fontSize="small" />}
              onClick={toCloudHandler.autoGenerateName}
              disabled={saveInfo.isLoading}
              title={t("toolBar.save.common.button.autoGenerate")}
            />
          </Stack>

          <SelectInput
            label={t("toolBar.save.children.toCloud.children.type.title")}
            value={saveInfo.type}
            onChange={toCloudHandler.changeType}
            options={data.types}
          />
        </Box>
      );
    }, [saveInfo, data]);

  const saveToCloudDialogAction: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <TooltipButton
          onClick={saveToCloudHandler}
          disabled={saveInfo.isLoading || !saveInfo.name}
          isLoading={saveInfo.isLoading}
          title={t("toolBar.save.common.button.save")}
        >
          {t("toolBar.save.common.button.save")}
        </TooltipButton>
      );
    }, [saveToCloudHandler]);

  const importFromCloudDialogTitle: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {t("toolBar.import.children.fromCloud.title")}

          <TooltipButton
            title={t("toolBar.import.common.button.close")}
            onClick={fromCloudHandler.close}
            icon={<CloseTwoTone fontSize="small" />}
            color={"error"}
          />
        </Box>
      );
    }, [t]);

  const importFromCloudDialogContent: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Divider />

          <SelectInput
            label={t("toolBar.import.children.fromCloud.children.name.title")}
            value={importInfo.name}
            onChange={fromCloudHandler.changeName}
            onOpen={fetchReportHandler}
            required={true}
            options={reports}
          />
        </Box>
      );
    }, [importInfo.name, reports, fetchReportHandler]);

  const importFromCloudDialogAction: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <TooltipButton
          onClick={importFromCloudHandler}
          disabled={importInfo.isLoading || !importInfo.name}
          isLoading={importInfo.isLoading}
          title={t("toolBar.import.common.button.import")}
        >
          {t("toolBar.import.common.button.import")}
        </TooltipButton>
      );
    }, [importFromCloudHandler]);

  useDebounceHotKey({
    keys: ["ctrl+shift+s", "cmd+shift+s"],
    callback: () => {
      saveToCloudHandler();
    },
    deps: [saveToCloudHandler],
  });

  return (
    <>
      <ButtonGroup variant={"contained"} size={"small"}>
        {/* Save */}
        <PopperButton icon={<SaveTwoTone />} title={t("toolBar.save.title")}>
          <Paper
            elevation={4}
            sx={{
              padding: "0.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <TooltipButton
              icon={
                <>
                  <SaveTwoTone
                    fontSize={"small"}
                    sx={{
                      marginRight: "0.25rem",
                    }}
                  />
                  {t("toolBar.save.children.save.title")}
                </>
              }
              title={t("toolBar.save.children.save.title")}
              onClick={saveHandler}
              sx={{
                justifyContent: "flex-start",
              }}
              disabled={saveInfo.isLoading}
              isLoading={saveInfo.isLoading}
            />

            <TooltipButton
              icon={
                <>
                  <CloudTwoTone
                    fontSize={"small"}
                    sx={{
                      marginRight: "0.25rem",
                    }}
                  />
                  {t("toolBar.save.children.toCloud.title")}
                </>
              }
              title={t("toolBar.save.children.toCloud.title")}
              onClick={openSaveToCloudHandler}
              sx={{
                justifyContent: "flex-start",
              }}
              disabled={saveInfo.isLoading}
              isLoading={saveInfo.isLoading}
            />
          </Paper>
        </PopperButton>

        {/* Export */}
        <TooltipButton
          icon={<DownloadTwoTone />}
          title={t("toolBar.export.title")}
          disabled={!shapeList.length}
          onClick={openSettingHandler}
        />

        {/* Import */}
        <PopperButton
          icon={<UploadTwoTone />}
          title={t("toolBar.import.title")}
        >
          <Paper
            elevation={4}
            sx={{
              padding: "0.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <ImportFileButton
              icon={
                <>
                  <DevicesTwoTone
                    fontSize={"small"}
                    sx={{
                      marginRight: "0.25rem",
                    }}
                  />
                  {t("toolBar.import.children.fromDevice.title")}
                </>
              }
              title={t("toolBar.import.children.fromDevice.title")}
              acceptMimeType={"application/json"}
              onFileLoaded={importFromDeviceHandler}
              sx={{
                justifyContent: "flex-start",
              }}
            />

            <TooltipButton
              icon={
                <>
                  <CloudTwoTone
                    fontSize={"small"}
                    sx={{
                      marginRight: "0.25rem",
                    }}
                  />
                  {t("toolBar.import.children.fromCloud.title")}
                </>
              }
              title={t("toolBar.import.children.fromCloud.title")}
              onClick={fromCloudHandler.open}
              sx={{
                justifyContent: "flex-start",
              }}
            />
          </Paper>
        </PopperButton>
      </ButtonGroup>

      {/* Export Dialog */}
      <BasicDialog
        maxWidth={"xl"}
        open={exportInfo.isOpen}
        onClose={settingHandler.onClose}
        dialogTitle={exportDialogTitle}
        dialogContent={exportDialogContent}
        dialogAction={exportDialogAction}
      />

      {/* Save To Cloud Dialog */}
      <BasicDialog
        open={saveInfo.isOpen}
        onClose={toCloudHandler.onClose}
        dialogTitle={saveToCloudDialogTitle}
        dialogContent={saveToCloudDialogContent}
        dialogAction={saveToCloudDialogAction}
      />

      {/* Import From Cloud Dialog */}
      <BasicDialog
        open={importInfo.isOpen}
        onClose={fromCloudHandler.onClose}
        dialogTitle={importFromCloudDialogTitle}
        dialogContent={importFromCloudDialogContent}
        dialogAction={importFromCloudDialogAction}
      />
    </>
  );
});
