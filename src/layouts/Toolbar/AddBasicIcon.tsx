import { useShapesContext, useStageContext } from "../../contexts";
import { PartialItemGrid } from "../../components/PartialItemGrid";
import { TooltipButton } from "../../components/TooltipButton";
import { KonvaIcon, KonvaDragDrop } from "../../types/Konva";
import { PopperButton } from "../../components/PopperButton";
import { LoadingImage } from "../../components/LoadingImage";
import { InsertEmoticonTwoTone } from "@mui/icons-material";
import { createPathsFromSVG } from "../../utils/Shapes";
import { abortRequest } from "../../utils/Request";
import { CellComponentProps } from "react-window";
import { useTranslation } from "react-i18next";
import { IconInfo, ItemInfo } from "./Types";
import { getIcons } from "../../apis/icon";
import { AxiosResponse } from "axios";
import { Box } from "@mui/material";
import React from "react";

export const ToolbarAddBasicIcon = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { getStageCenter, updateSnackbarAlert } = useStageContext();

  const { addShapes } = useShapesContext();

  const addIconHandler = React.useCallback(
    async (value: string): Promise<void> => {
      try {
        const data: KonvaDragDrop = JSON.parse(value) as KonvaDragDrop;

        await addShapes(
          [
            {
              type: data.type,
              paths: createPathsFromSVG(data.pathURL, 200, 200),
            },
          ],
          false,
          false,
          getStageCenter()
        );
      } catch (error) {
        updateSnackbarAlert(
          `${t("toolBar.addShape.common.snackBarAlert.error")} ${error}`,
          "error"
        );
      }
    },
    [t, addShapes, getStageCenter, updateSnackbarAlert]
  );

  const dragIconHandler = React.useCallback(
    (e: React.DragEvent<HTMLButtonElement>): void => {
      e.dataTransfer?.setData("data", e.currentTarget?.value);
    },
    []
  );

  const iconInitRef = React.useRef<IconInfo>({
    isLoading: false,
    icons: [],
  });

  const iconConfigRef = React.useRef<ItemInfo>({
    renderColumn: 4,
    renderRow: 3,
    itemSize: 20,
    itemWidth: 36,
    itemHeight: 32,
  });

  const [iconInfo, setIconInfo] = React.useState<IconInfo>(iconInitRef.current);

  const fetchIconControllerRef = React.useRef<AbortController>(undefined);

  const fetchIconHandler = React.useCallback(async (): Promise<void> => {
    if (iconInfo.icons?.length) {
      return;
    }

    try {
      setIconInfo((prev) => ({
        ...prev,
        isLoading: true,
      }));

      // Cancel previous request
      fetchIconControllerRef.current = abortRequest(
        fetchIconControllerRef.current,
        true
      );

      const response: AxiosResponse = await getIcons({
        type: "basic",
      });

      setIconInfo({
        isLoading: false,
        icons: response.data as KonvaIcon[],
      });
    } catch (error) {
      setIconInfo(iconInitRef.current);

      updateSnackbarAlert(
        `${t("toolBar.addBasicIcon.common.snackBarAlert.error")} ${error}`,
        "error"
      );
    }
  }, [t, iconInfo.icons, updateSnackbarAlert]);

  const IconCell = React.useCallback(
    (prop: CellComponentProps): React.JSX.Element => {
      const index =
        prop.rowIndex * iconConfigRef.current.renderColumn + prop.columnIndex;
      if (index >= iconInfo.icons.length) {
        return;
      }

      const icon: KonvaIcon = iconInfo.icons[index];

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
              <LoadingImage
                alt={icon.name}
                src={`data:image/svg+xml;utf8,${encodeURIComponent(icon.content)}`}
                width={iconConfigRef.current.itemSize}
                height={iconConfigRef.current.itemSize}
                draggable={false}
                fallbackSrc={"./assets/images/placeholder.png"}
              />
            }
            value={JSON.stringify({
              type: "path",
              pathURL: icon.content,
            })}
            title={icon.name}
            sx={{
              minWidth: iconConfigRef.current.itemWidth,
              minHeight: iconConfigRef.current.itemHeight,
            }}
            onClick={addIconHandler}
            draggable={true}
            onDragStart={dragIconHandler}
          />
        </Box>
      );
    },
    [addIconHandler, iconInfo.icons]
  );

  {
    /* Add Icon */
  }
  return (
    <PopperButton
      icon={<InsertEmoticonTwoTone />}
      title={t("toolBar.addBasicIcon.title")}
      onClick={fetchIconHandler}
    >
      <PartialItemGrid
        isLoading={iconInfo.isLoading}
        cellComponent={IconCell}
        items={iconInfo.icons}
        renderColumn={iconConfigRef.current.renderColumn}
        renderRow={iconConfigRef.current.renderRow}
        itemWidth={iconConfigRef.current.itemWidth}
        itemHeight={iconConfigRef.current.itemHeight}
      />
    </PopperButton>
  );
});
