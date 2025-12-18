import { PartialItemGrid } from "../../components/PartialItemGrid";
import { useShapesContext, useStageContext } from "../../contexts";
import { TooltipButton } from "../../components/TooltipButton";
import { PopperButton } from "../../components/PopperButton";
import { Report, searchReport } from "../../apis/report";
import { KonvaShape } from "../../components/KonvaShape";
import { ShapeLineTwoTone } from "@mui/icons-material";
import { abortRequest } from "../../utils/Request";
import { IMAGE_STORAGE_URL } from "../../configs";
import { CellComponentProps } from "react-window";
import { KonvaDragDrop } from "../../types/Konva";
import { ReportInfo, ItemInfo } from "./Types";
import { useTranslation } from "react-i18next";
import { downloadFile } from "../../apis/file";
import { AxiosResponse } from "axios";
import { Box } from "@mui/material";
import { nanoid } from "nanoid";
import React from "react";

export const ToolbarAddComponent = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { getStageCenter, updateSnackbarAlert } = useStageContext();

  const { addShapes } = useShapesContext();

  const componentInitRef = React.useRef<ReportInfo>({
    isLoading: false,
    reports: [],
  });

  const [componentInfo, setComponentInfo] = React.useState<ReportInfo>(
    componentInitRef.current
  );

  const dragComponentHandler = React.useCallback(
    (e: React.DragEvent<HTMLButtonElement>): void => {
      e.dataTransfer?.setData("data", e.currentTarget?.value);
    },
    []
  );

  const componentConfigRef = React.useRef<ItemInfo>({
    renderColumn: 2,
    renderRow: 2,
    itemSize: 72,
    itemWidth: 88,
    itemHeight: 88,
  });

  const fetchComponentControllerRef = React.useRef<AbortController>(undefined);

  const fetchComponentHandler = React.useCallback(async (): Promise<void> => {
    try {
      setComponentInfo((prev) => ({
        ...prev,
        isLoading: true,
      }));

      // Cancel previous request
      fetchComponentControllerRef.current = abortRequest(
        fetchComponentControllerRef.current,
        true
      );

      // Call API to search report
      const response: AxiosResponse = await searchReport({
        controller: fetchComponentControllerRef.current,
        desc: true,
      });

      setComponentInfo({
        isLoading: false,
        reports: (response.data as Report[]).filter((item) => item.type === 3),
      });
    } catch (error) {
      setComponentInfo(componentInitRef.current);

      updateSnackbarAlert(
        `${t("toolBar.addComponent.common.snackBarAlert.error")} ${error}`,
        "error"
      );
    }
  }, [t, updateSnackbarAlert]);

  const addComponentHandler = React.useCallback(
    async (value: string): Promise<void> => {
      try {
        const data: KonvaDragDrop = JSON.parse(value) as KonvaDragDrop;

        // Call API to download file
        const fileResponse: AxiosResponse = await downloadFile({
          id: data.componentURL,
          responseType: "json",
        });

        const shapes: KonvaShape[] = fileResponse.data as KonvaShape[];

        // Create new ids
        const newShapeIds: Record<string, string> = {};

        shapes.forEach((shape) => {
          newShapeIds[shape.id] = nanoid();
        });

        const groups: Record<string, string[]> = {};

        shapes.forEach((shape) => {
          if (shape.groupIds && !groups[newShapeIds[shape.groupIds[0]]]) {
            groups[newShapeIds[shape.groupIds[0]]] = shape.groupIds.map(
              (id) => newShapeIds[id]
            );
          }
        });

        const newShapes: KonvaShape[] = shapes.map((item) => {
          const { id, groupIds, ...newShape }: KonvaShape = item;

          newShape.id = newShapeIds[item.id];

          if (groupIds) {
            newShape.groupIds = groups[newShapeIds[groupIds[0]]];
            newShape.originGroupIds = newShape.groupIds;
          }

          return newShape;
        });

        // Add shapes
        await addShapes(newShapes, false, true, getStageCenter());
      } catch (error) {
        updateSnackbarAlert(
          `${t("toolBar.addTComponent.common.snackBarAlert.error")} ${error}`,
          "error"
        );
      }
    },
    [t, addShapes, getStageCenter, updateSnackbarAlert]
  );

  const ComponentCell = React.useCallback(
    (prop: CellComponentProps): React.JSX.Element => {
      const index: number =
        prop.rowIndex * componentConfigRef.current.renderColumn +
        prop.columnIndex;
      if (index >= componentInfo.reports.length) {
        return;
      }

      const component: Report = componentInfo.reports[index];
      const componentURL: string = `${IMAGE_STORAGE_URL}/files/${component.image_file_id}/download`;

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
                src={componentURL}
                alt={component.name}
                width={componentConfigRef.current.itemSize}
                height={componentConfigRef.current.itemSize}
                draggable={false}
                sx={{
                  objectFit: "contain",
                }}
              />
            }
            value={JSON.stringify({
              componentURL: component.json_file_id,
            })}
            title={component.name}
            sx={{
              minWidth: componentConfigRef.current.itemWidth,
              minHeight: componentConfigRef.current.itemHeight,
            }}
            onClick={addComponentHandler}
            draggable={true}
            onDragStart={dragComponentHandler}
          />
        </Box>
      );
    },
    [componentInfo.reports]
  );

  {
    /* Add Component */
  }
  return (
    <PopperButton
      icon={<ShapeLineTwoTone />}
      title={t("toolBar.addComponent.title")}
      onClick={fetchComponentHandler}
    >
      <PartialItemGrid
        isLoading={componentInfo.isLoading}
        cellComponent={ComponentCell}
        items={componentInfo.reports}
        renderColumn={componentConfigRef.current.renderColumn}
        renderRow={componentConfigRef.current.renderRow}
        itemWidth={componentConfigRef.current.itemWidth}
        itemHeight={componentConfigRef.current.itemHeight}
      />
    </PopperButton>
  );
});
