import { useShapesContext, useStageContext } from "../../contexts";
import { PartialItemGrid } from "../../components/PartialItemGrid";
import { TooltipButton } from "../../components/TooltipButton";
import { KonvaIcon, KonvaDragDrop } from "../../types/Konva";
import { PopperButton } from "../../components/PopperButton";
import { LoadingImage } from "../../components/LoadingImage";
import { MilitaryTechTwoTone } from "@mui/icons-material";
import { abortRequest } from "../../utils/Request";
import { stringToBase64 } from "../../utils/Image";
import { removeSvgTag } from "../../utils/Shapes";
import { CellComponentProps } from "react-window";
import { useTranslation } from "react-i18next";
import { IconInfo, ItemInfo } from "./Types";
import { getIcons } from "../../apis/icon";
import { AxiosResponse } from "axios";
import { Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DraggableTabsPanel from "../../components/DraggableTabsPanel/DraggableTabsPanelProps";
import React from "react";

export const ToolbarAddMilitaryIcon = React.memo((): React.JSX.Element => {
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
              imageURL: await stringToBase64(
                removeSvgTag(data.svgURL, "text"),
                "svg"
              ),
            },
          ],
          false,
          true,
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

  const [groupedIcons, setGroupedIcons] = React.useState<
    Record<string, KonvaIcon[]>
  >({});

  const [tabsState, setTabsState] = React.useState<{
    key: string;
    label: string;
  }[]>([]);

  const [panelOpen, setPanelOpen] = React.useState(false);

  const fetchIconControllerRef = React.useRef<AbortController>(undefined);

  const fetchIconHandler = React.useCallback(async (): Promise<void> => {
    if (iconInfo.icons?.length) {
      // if we already loaded, just open panel
      setPanelOpen(true);
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

      const response: AxiosResponse = await getIcons({ type: "military" });

      // keep grouped icons by top-level keys (categories)
      const data: any = response.data;

      const groups = Object.entries(data).reduce(
        (acc: Record<string, KonvaIcon[]>, [key, item]: any) => {
          acc[key] = item?.svgs || [];

          return acc;
        },
        {}
      );

      const tabs = Object.entries(data).map(([key, item]: any) => ({
        key,
        label: item?.title || key,
      }));

      setIconInfo((prev) => ({ ...prev, isLoading: false }));
      setGroupedIcons(groups);
      setTabsState(tabs);
      setPanelOpen(true);
    } catch (error) {
      setIconInfo(iconInitRef.current);

      updateSnackbarAlert(
        `${t("toolBar.addMilitaryIcon.common.snackBarAlert.error")} ${error}`,
        "error"
      );
    }
  }, [t, iconInfo.icons, updateSnackbarAlert]);

  // factory to create a cell renderer for a specific icon list (no hooks inside)
  const makeIconCell = (icons: KonvaIcon[]) => {
    return (prop: CellComponentProps): React.JSX.Element | null => {
      const index =
        prop.rowIndex * iconConfigRef.current.renderColumn + prop.columnIndex;
      if (!icons || index >= icons.length) {
        return null;
      }

      const icon: KonvaIcon = icons[index];

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
                src={`data:image/svg+xml;utf8,${encodeURIComponent(
                  icon.content
                )}`}
                width={iconConfigRef.current.itemSize}
                height={iconConfigRef.current.itemSize}
                draggable={false}
                fallbackSrc={"./assets/images/placeholder.png"}
                sx={{
                  backgroundColor: "#000000",
                }}
              />
            }
            value={JSON.stringify({
              type: "image",
              svgURL: icon.content,
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
    };
  };

  {
    /* Add Icon */
  }
  return (
    <>
      <PopperButton
        icon={<MilitaryTechTwoTone />}
        title={t("toolBar.addMilitaryIcon.title")}
        onClick={fetchIconHandler}
      />

      {panelOpen && (
        <DraggableTabsPanel
          tabs={tabsState}
          data={groupedIcons}
          renderTab={(key: string, data: Record<string, KonvaIcon[]>) => {
            const icons = data?.[key] || [];
            const Cell = makeIconCell(icons);

            const panelW = Math.min(window?.innerWidth - 80, 560);
            const panelH = Math.min(window?.innerHeight - 120, 360);

            // header ~40, tabs ~48, padding ~24 => remaining height for grid
            const headerH = 40;
            const tabsH = 48;
            const padding = 24;

            const paddingHorizontal = 24; // panel content padding left+right (12+12)
            const paddingVertical = 24; // top+bottom padding estimate

            const availableWidth = Math.max(220, panelW - paddingHorizontal);
            const availableHeight = Math.max(
              140,
              panelH - headerH - tabsH - paddingVertical
            );

            const gapX = 8;
            const gapY = 8;
            const itemW = iconConfigRef.current.itemWidth;
            const itemH = iconConfigRef.current.itemHeight;

            const columnUnit = itemW + gapX;
            const rowUnit = itemH + gapY;

            const dynamicColumns = Math.max(1, Math.floor(availableWidth / columnUnit));
            const dynamicRows = Math.max(1, Math.floor(availableHeight / rowUnit));

            return (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <PartialItemGrid
                    isLoading={iconInfo.isLoading}
                    cellComponent={Cell}
                    items={icons}
                    renderColumn={dynamicColumns}
                    renderRow={dynamicRows}
                    itemWidth={iconConfigRef.current.itemWidth}
                    itemHeight={iconConfigRef.current.itemHeight}
                  />
                </Box>
              </Box>
            );
          }}
          title={t("toolBar.addMilitaryIcon.title")}
          width={Math.min(window?.innerWidth - 220, 570)}
          height={Math.min(window?.innerHeight - 520, 360)}
          onClose={() => setPanelOpen(false)}
          defaultPosition={{
            x: Math.max(40, window?.innerWidth / 2 - 280),
            y: Math.max(20, window?.innerHeight / 2 - 180),
          }}
        />
      )}
    </>
  );
});
