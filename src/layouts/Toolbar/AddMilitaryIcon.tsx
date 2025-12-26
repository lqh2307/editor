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
import { Box, IconButton, TextField, InputAdornment, Select, MenuItem, CircularProgress } from "@mui/material";
import SearchTwoTone from '@mui/icons-material/SearchTwoTone';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { getValue, setValue } from "../../utils/LocalStorage";
import DraggableTabsPanel from "../../components/DraggableTabsPanel/DraggableTabsPanelProps";
import { useDebounce } from "../../hooks";
import React from "react";
import { Calibration } from "../../utils/Map/Utils";

export const ToolbarAddMilitaryIcon = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { getStageCenter, updateSnackbarAlert } = useStageContext();

  const { addShapes, shapeList, updateShape } = useShapesContext();

  // Temporary calibration. Replace with real one from your map context/state.
  const calibrationRef = React.useRef<Calibration>({
    topRight: { lat: 23.343927, lon: 112.520316 },
    bottomLeft: { lat: 18.708556, lon: 102.228061 },
  });

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
  const [activeKey, setActiveKey] = React.useState<string | undefined>(undefined);

  const [searchInput, setSearchInput] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [debouncedSetQuery] = useDebounce((v: string) => setSearchQuery(v), 300, []);

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

  const prevHistoryMapRef = React.useRef<Record<string, boolean>>({});

  React.useEffect(() => {
    console.log("shapeList changed", shapeList);
  } , [shapeList]);

  React.useEffect(() => {
    if (!Array.isArray(shapeList) || !shapeList.length) return;

    const prev = prevHistoryMapRef.current;

    for (const s of shapeList) {
      if (s?.type !== "image") continue;

      const had = !!prev[s.id];
      const hasNow = Array.isArray(s.locationHistory) && s.locationHistory.length > 0;

      // Auto-attach demo location history when a new military icon is added
      if (!had && !hasNow) {
        const { topRight, bottomLeft } = calibrationRef.current;
        const steps = 6;
        const hist = Array.from({ length: steps }, (_, i) => {
          const t = i / (steps - 1);
          return {
            lon: bottomLeft.lon + (topRight.lon - bottomLeft.lon) * t,
            lat: topRight.lat + (bottomLeft.lat - topRight.lat) * (t * 0.9),
          };
        });

        updateShape({ id: s.id, locationHistory: hist }, true, true);
        prev[s.id] = true;
      } else {
        prev[s.id] = hasNow;
      }
    }
  }, [shapeList, updateShape]);

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
      // open panel immediately to show loading state under button
      setPanelOpen(true);
      setActiveKey((prev) => prev ?? "__placeholder");
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
      // already opened above
    } catch (error) {
      setIconInfo(iconInitRef.current);

      updateSnackbarAlert(
        `${t("toolBar.addMilitaryIcon.common.snackBarAlert.error")} ${error}`,
        "error"
      );
    }
  }, [t, groupedIcons, updateSnackbarAlert]);

  // keep active tab key valid when tabs/favorites change while panel open
  React.useEffect(() => {
    if (!panelOpen) return;
    const favKey = "__favorites";
    const hasFav = favorites.length > 0;
    const keys = (hasFav ? [favKey] : []).concat(tabsState.map((t) => t.key));
    if (!keys.length) return;
    setActiveKey((prev) => (prev && keys.includes(prev) ? prev : keys[0]));
  }, [panelOpen, favorites.length, tabsState]);

  // Cache data URLs for SVG thumbnails to avoid recomputation on each render
  const svgDataUrlCacheRef = React.useRef<Map<string, string>>(new Map());
  const getSvgDataUrl = React.useCallback((svg: string): string => {
    const cached = svgDataUrlCacheRef.current.get(svg);
    if (cached) return cached;
    try {
      const base64 = typeof window !== 'undefined'
        ? window.btoa(unescape(encodeURIComponent(svg)))
        : Buffer.from(svg, 'utf8').toString('base64');
      const url = `data:image/svg+xml;base64,${base64}`;
      svgDataUrlCacheRef.current.set(svg, url);
      return url;
    } catch {
      const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      svgDataUrlCacheRef.current.set(svg, url);
      return url;
    }
  }, []);

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
      const thumbSrc = getSvgDataUrl(icon.content);

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
                alt={icon.title}
                src={thumbSrc}
                width={iconConfigRef.current.itemSize}
                height={iconConfigRef.current.itemSize}
                draggable={false}
                fallbackSrc={"./assets/images/placeholder.png"}
                backgroundColor={"#ffffff"}
              />
            }
            value={JSON.stringify({
              type: "image",
              svgURL: icon.content,
            })}
            title={icon.title}
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
        closeOnClickAway={false}
      >
        {panelOpen ? (
          (() => {
            const favKey = "__favorites";
            const favTab = { key: favKey, label: t("toolBar.addMilitaryIcon.favorites") || "Favorites" };
            const tabsProp = favorites.length ? [favTab, ...tabsState] : tabsState;
            const dataProp = favorites.length ? { [favKey]: favorites, ...groupedIcons } : groupedIcons;

            const active = activeKey ?? "__placeholder";
            const dataWithPlaceholder = Object.keys(dataProp).length
              ? dataProp
              : { __placeholder: [] };

            return (
              <DraggableTabsPanel
                usePortal={false}
                draggable={false}
                bounds="parent"
                tabs={tabsProp}
                data={dataWithPlaceholder}
                hideTabs
                activeKey={active}
                onChangeActiveKey={setActiveKey}
                headerRight={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Select
                      size="small"
                      value={activeKey ?? ''}
                      onChange={(e) => setActiveKey(e.target.value as string)}
                      displayEmpty
                      sx={{ minWidth: 180, background: '#fff' }}
                      renderValue={(val) => {
                        if (!val) return t("common.select") || "Select";
                        const found = tabsProp.find((x) => x.key === val);
                        return found?.label || val;
                      }}
                    >
                      {tabsProp.map((tb) => (
                        <MenuItem key={tb.key} value={tb.key}>{tb.label}</MenuItem>
                      ))}
                    </Select>
                    <TextField
                      size="small"
                      placeholder={t("common.search") || "Search icons"}
                      value={searchInput}
                      onChange={(e) => { setSearchInput(e.target.value); debouncedSetQuery(e.target.value); }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchTwoTone fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                }
                renderTab={(key: string, data: Record<string, KonvaIcon[]>) => {
                  const icons = data?.[key] || [];
                  const q = (searchQuery || "").toLowerCase();
                  const filteredIcons = q
                    ? icons.filter((i) => (i?.title || "").toLowerCase().includes(q))
                    : icons;

                  const panelW = Math.min(window?.innerWidth - 80, 615);
                  const panelH = Math.min(window?.innerHeight - 120, 240);

                  // header ~40 (with controls), no tabs when hideTabs=true, padding ~24
                  const headerH = 40;
                  const tabsH = 0;
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

                  // Fixed 12 icons per row
                  const dynamicColumns = 13;
                  const dynamicRows = Math.max(1, Math.floor(availableHeight / rowUnit));

                  const Cell = makeIconCell(filteredIcons, dynamicColumns, favoritesSet, toggleFavorite);

                  return (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                height={Math.min(window?.innerHeight - 120, 240)}
              />
            );
          })()
        ) : iconInfo.isLoading ? (
          <Box sx={{ p: 2, background: '#fff', border: '1px solid #ddd', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <span>{t('common.loading') || 'Loading...'}</span>
          </Box>
        ) : null}
      </PopperButton>

    </>
  );
});
