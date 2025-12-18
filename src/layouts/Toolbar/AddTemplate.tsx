import { PartialItemGrid } from "../../components/PartialItemGrid";
import { useShapesContext, useStageContext } from "../../contexts";
import { TooltipButton } from "../../components/TooltipButton";
import { PopperButton } from "../../components/PopperButton";
import { LibraryBooksTwoTone } from "@mui/icons-material";
import { Report, searchReport } from "../../apis/report";
import { KonvaShape } from "../../components/KonvaShape";
import { abortRequest } from "../../utils/Request";
import { IMAGE_STORAGE_URL } from "../../configs";
import { CellComponentProps } from "react-window";
import { ItemInfo, ReportInfo } from "./Types";
import { useTranslation } from "react-i18next";
import { downloadFile } from "../../apis/file";
import { AxiosResponse } from "axios";
import { Box } from "@mui/material";
import React from "react";

export const ToolbarAddTemplate = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { updateSnackbarAlert } = useStageContext();

  const { addShapes } = useShapesContext();

  const templateInitRef = React.useRef<ReportInfo>({
    isLoading: false,
    reports: [],
  });

  const [templateInfo, setTemplateInfo] = React.useState<ReportInfo>(
    templateInitRef.current
  );

  const templateConfigRef = React.useRef<ItemInfo>({
    renderColumn: 1,
    renderRow: 1,
    itemSize: 176,
    itemWidth: 192,
    itemHeight: 184,
  });

  const fetchTemplateControllerRef = React.useRef<AbortController>(undefined);

  const fetchTemplateHandler = React.useCallback(async (): Promise<void> => {
    try {
      setTemplateInfo((prev) => ({
        ...prev,
        isLoading: true,
      }));

      // Cancel previous request
      fetchTemplateControllerRef.current = abortRequest(
        fetchTemplateControllerRef.current,
        true
      );

      // Call API to search report
      const response: AxiosResponse = await searchReport({
        controller: fetchTemplateControllerRef.current,
        desc: true,
      });

      setTemplateInfo({
        isLoading: false,
        reports: (response.data as Report[]).filter((item) => item.type === 2),
      });
    } catch (error) {
      setTemplateInfo(templateInitRef.current);

      updateSnackbarAlert(
        `${t("toolBar.addTemplate.common.snackBarAlert.error")} ${error}`,
        "error"
      );
    }
  }, [t, updateSnackbarAlert]);

  const applyTemplateHandler = React.useCallback(
    async (value: string): Promise<void> => {
      try {
        // Call API to download file
        const fileResponse: AxiosResponse = await downloadFile({
          id: value,
          responseType: "json",
        });

        // Add shapes
        await addShapes(
          fileResponse.data as KonvaShape[],
          true,
          true,
          undefined
        );

        updateSnackbarAlert(
          t("toolBar.addTemplate.common.snackBarAlert.apply"),
          "success"
        );
      } catch (error) {
        updateSnackbarAlert(
          `${t("toolBar.addTemplate.common.snackBarAlert.error")} ${error}`,
          "error"
        );
      }
    },
    [t, addShapes, updateSnackbarAlert]
  );

  const TemplateCell = React.useCallback(
    (prop: CellComponentProps): React.JSX.Element => {
      const index: number =
        prop.rowIndex * templateConfigRef.current.renderColumn +
        prop.columnIndex;
      if (index >= templateInfo.reports.length) {
        return;
      }

      const template: Report = templateInfo.reports[index];
      const templateURL: string = `${IMAGE_STORAGE_URL}/files/${template.image_file_id}/download`;

      return (
        <Box
          style={prop.style}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TooltipButton
            icon={
              <Box
                component={"img"}
                src={templateURL}
                alt={template.name}
                width={templateConfigRef.current.itemSize}
                height={templateConfigRef.current.itemSize}
                draggable={false}
                sx={{
                  objectFit: "contain",
                }}
              />
            }
            value={template.json_file_id}
            title={template.name}
            sx={{
              minWidth: templateConfigRef.current.itemWidth,
              minHeight: templateConfigRef.current.itemHeight,
            }}
            onClick={applyTemplateHandler}
          />
        </Box>
      );
    },
    [templateInfo.reports]
  );

  {
    /* Add Template */
  }
  return (
    <PopperButton
      icon={<LibraryBooksTwoTone />}
      title={t("toolBar.addTemplate.title")}
      onClick={fetchTemplateHandler}
    >
      <PartialItemGrid
        isLoading={templateInfo.isLoading}
        cellComponent={TemplateCell}
        items={templateInfo.reports}
        renderColumn={templateConfigRef.current.renderColumn}
        renderRow={templateConfigRef.current.renderRow}
        itemWidth={templateConfigRef.current.itemWidth}
        itemHeight={templateConfigRef.current.itemHeight}
      />
    </PopperButton>
  );
});
