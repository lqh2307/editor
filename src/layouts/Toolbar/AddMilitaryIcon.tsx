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
import { Box, IconButton, TextField, InputAdornment } from "@mui/material";
import SearchTwoTone from '@mui/icons-material/SearchTwoTone';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { getValue, setValue } from "../../utils/LocalStorage";
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

  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const FAVORITES_KEY = "toolbar_military_icon_favorites_v1";

  const [favorites, setFavorites] = React.useState<KonvaIcon[]>([]);

  React.useEffect(() => {
    try {
      const stored = (getValue(FAVORITES_KEY) as KonvaIcon[]) || [];
      setFavorites(stored);
    } catch (e) {
      // ignore
    }
  }, []);

  const favoritesSet = React.useMemo(
    () => new Set(favorites.map((f) => f.content)),
    [favorites]
  );

  const toggleFavorite = React.useCallback((icon: KonvaIcon) => {
    setFavorites((prev) => {
      const exists = prev.find((p) => p.content === icon.content);
      const next = exists ? prev.filter((p) => p.content !== icon.content) : [icon, ...prev];
      try {
        setValue(FAVORITES_KEY, next);
      } catch (e) {
        // ignore
      }
      return next;
    });
  }, []);

  const fetchIconControllerRef = React.useRef<AbortController>(undefined);

  const fetchIconHandler = React.useCallback(async (): Promise<void> => {
    // if we already loaded grouped icons, just open panel
    if (Object.keys(groupedIcons).length) {
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

      // flatten icons so we can short-circuit next time and also keep grouped data
      const flatIcons: KonvaIcon[] = Object.values(groups).flat();

      setIconInfo((prev) => ({ ...prev, isLoading: false, icons: flatIcons }));
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
  }, [t, groupedIcons, updateSnackbarAlert]);

  // factory to create a cell renderer for a specific icon list (no hooks inside)
  const makeIconCell = (
    icons: KonvaIcon[],
    columns: number,
    favSet: Set<string>,
    toggleFav: (icon: KonvaIcon) => void
  ) => {
    return (prop: CellComponentProps): React.JSX.Element | null => {
      const index = prop.rowIndex * columns + prop.columnIndex;
      if (!icons || index >= icons.length) {
        return null;
      }

      const icon: KonvaIcon = icons[index];
      const isFav = favSet.has(icon.content);

      return (
        <Box
          style={prop.style}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
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

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleFav(icon);
            }}
            sx={{
              position: "absolute",
              top: -2,
              right: -2,
              p: 0.2,
              width: 20,
              height: 20,
              zIndex: 3,
              boxShadow: 'none',
              '&:hover': { background: 'rgba(255,255,255,0.95)' },
              fontSize: 14,
            }}
            aria-label={isFav ? "remove favorite" : "add favorite"}
          >
            {isFav ? (
              <Favorite fontSize="inherit" color="error" />
            ) : (
              <FavoriteBorder fontSize="inherit" />
            )}
          </IconButton>
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
        (() => {
          const favKey = "__favorites";
          const favTab = { key: favKey, label: t("toolBar.addMilitaryIcon.favorites") || "Favorites" };
          const tabsProp = favorites.length ? [favTab, ...tabsState] : tabsState;
          const dataProp = favorites.length ? { [favKey]: favorites, ...groupedIcons } : groupedIcons;

          return (
            <DraggableTabsPanel
              tabs={tabsProp}
              data={dataProp}
              renderTab={(key: string, data: Record<string, KonvaIcon[]>) => {
                const icons = data?.[key] || [];
                const q = (searchQuery || "").toLowerCase();
                const filteredIcons = q
                  ? icons.filter((i) => (i?.name || "").toLowerCase().includes(q))
                  : icons;

                const panelW = Math.min(window?.innerWidth - 80, 615);
                const panelH = Math.min(window?.innerHeight - 120, 360);

                // header ~40, tabs ~48, padding ~24 => remaining height for grid
                const headerH = 40;
                const tabsH = 48;
                const padding = 24;

                const paddingHorizontal = 24; // panel content padding left+right (12+12)
                const paddingVertical = 24; // top+bottom padding estimate

                const availableWidth = Math.max(220, panelW - paddingHorizontal);
                const availableHeight = Math.max(140, panelH - headerH - tabsH - paddingVertical);

                const gapX = 8;
                const gapY = 8;
                const itemW = iconConfigRef.current.itemWidth;
                const itemH = iconConfigRef.current.itemHeight;

                const columnUnit = itemW + gapX;
                const rowUnit = itemH + gapY;

                const dynamicColumns = Math.max(1, Math.floor(availableWidth / columnUnit));
                const dynamicRows = Math.max(1, Math.floor(availableHeight / rowUnit));

                const Cell = makeIconCell(filteredIcons, dynamicColumns, favoritesSet, toggleFavorite);

                return (
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 0, mb: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder={t("common.search") || "Search icons"}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchTwoTone fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                      <PartialItemGrid
                        isLoading={iconInfo.isLoading}
                        cellComponent={Cell}
                        items={filteredIcons}
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
              width={Math.min(window?.innerWidth - 80, 615)}
              height={Math.min(window?.innerHeight - 120, 360)}
              onClose={() => setPanelOpen(false)}
              defaultPosition={{
                x: Math.max(40, window?.innerWidth / 2 - 280),
                y: Math.max(20, window?.innerHeight / 2 - 180),
              }}
            />
          );
        })()
      )}
    </>
  );
});
