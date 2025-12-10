import { useShapesContext, useStageContext } from "../../contexts";
import { TooltipButton } from "../../components/TooltipButton";
import { createPathsFromSVG } from "../../utils/Shapes";
import { getIcons } from "../../apis/icon";
import { KonvaIcon } from "../../types/Konva";
import { ApiTwoTone, CasinoTwoTone } from "@mui/icons-material";
import { AxiosResponse } from "axios";
import React from "react";

type FakeApiEvent = {
  key: string;
  x: number;
  y: number;
};

async function mockFetchIconEvent(): Promise<FakeApiEvent> {
  await new Promise((r) => setTimeout(r, 200));
  return { key: "symbol_air", x: 102, y: 20 };
}

function normalize(s: string): string {
  return s?.toLowerCase().replace(/\s+/g, "");
}

function pickIconByKey(icons: KonvaIcon[], key: string): KonvaIcon | undefined {
  const alias: Record<string, string[]> = {
    symbol_air: ["Airplane", "Airplane Engines"],
  };

  const candidates = alias[key] ?? [];
  for (const name of candidates) {
    const found = icons.find((i) => i.name === name);
    if (found) return found;
  }

  const raw = key.replace(/^symbol_/, "");
  const nRaw = normalize(raw);
  return icons.find((i) => normalize(i.name).includes(nRaw));
}

function pickRandomIcon(icons: KonvaIcon[]): KonvaIcon | undefined {
  if (!icons?.length) return undefined;
  const idx = Math.floor(Math.random() * icons.length);
  return icons[idx];
}

export const ToolbarFakeAPI = React.memo((): React.JSX.Element => {
  const { addShapes } = useShapesContext();
  const { updateSnackbarAlert } = useStageContext();

  const [icons, setIcons] = React.useState<KonvaIcon[] | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  const ensureIcons = React.useCallback(async (): Promise<KonvaIcon[]> => {
    if (icons && icons.length) return icons;
    setLoading(true);
    try {
      const resp: AxiosResponse = await getIcons({});
      const data = resp.data as KonvaIcon[];
      setIcons(data);
      return data;
    } catch (err) {
      setIcons([]);
      updateSnackbarAlert?.(`Load icons failed: ${err}`, "error");
      return [];
    } finally {
      setLoading(false);
    }
  }, [icons, updateSnackbarAlert]);

  const onClick = React.useCallback(async (): Promise<void> => {
    try {
      const list = await ensureIcons();
      if (!list.length) return;

      const event = await mockFetchIconEvent();
      const icon = pickIconByKey(list, event.key);
      if (!icon) {
        updateSnackbarAlert?.(`Không tìm thấy icon cho key: ${event.key}` , "warning");
        return;
      }

      await addShapes(
        [
          {
            type: "path",
            paths: createPathsFromSVG(icon.content, 200, 200),
          },
        ],
        false,
        false,
        { x: event.x, y: event.y }
      );
    } catch (err) {
      updateSnackbarAlert?.(`Fake API lỗi: ${err}`, "error");
    }
  }, [addShapes, ensureIcons, updateSnackbarAlert]);

  const onClickRandom = React.useCallback(async (): Promise<void> => {
    try {
      const list = await ensureIcons();
      if (!list.length) return;

      const icon = pickRandomIcon(list);
      if (!icon) return;

      await addShapes(
        [
          {
            type: "path",
            paths: createPathsFromSVG(icon.content, 200, 200),
          },
        ],
        false,
        false,
        { x: 200, y: 200 }
      );
    } catch (err) {
      updateSnackbarAlert?.(`Fake API lỗi: ${err}`, "error");
    }
  }, [addShapes, ensureIcons, updateSnackbarAlert]);

  return (
    <>
      {/* <TooltipButton
        icon={<ApiTwoTone />}
        title={"Fake API"}
        onClick={onClick}
        disabled={loading}
      /> */}
      <TooltipButton
        icon={<CasinoTwoTone />}
        title={"Random Icon"}
        onClick={onClickRandom}
        disabled={loading}
      />
    </>
  );
});
