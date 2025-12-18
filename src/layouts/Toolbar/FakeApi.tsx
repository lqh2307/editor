import { useShapesContext, useStageContext } from "../../contexts";
import { TooltipButton } from "../../components/TooltipButton";
import { createPathsFromSVG } from "../../utils/Shapes";
import { getIcons } from "../../apis/icon";
import { KonvaIcon } from "../../types/Konva";
import { ImageTwoTone } from "@mui/icons-material";
import { AxiosResponse } from "axios";
import React from "react";
import { useMapContext } from "../../contexts";

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
  const { addShapes, alignShape } = useShapesContext();
  const { updateSnackbarAlert } = useStageContext();
  const { setTopRight, setBottomLeft } = useMapContext();

  const [icons, setIcons] = React.useState<KonvaIcon[] | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  const ensureIcons = React.useCallback(async (): Promise<KonvaIcon[]> => {
    if (icons && icons.length) return icons;
    setLoading(true);
    try {
      const resp: AxiosResponse = await getIcons({ type: undefined });
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

  const onClickImportTestImage = React.useCallback(async (): Promise<void> => {
    try {
      const trLon = 106 + Math.random();
      const trLat = 22 + Math.random();
      const blLon = 104 + Math.random();
      const blLat = 20 + Math.random();

      await addShapes(
        [
          {
            type: "image",
            imageURL: `./assets/images/test.png`,
          },
        ],
        false,
        false,
        { x: 0, y: 0 }
      );

      // Align the newly added image to the stage top-left
      alignShape(undefined, "left", "top");
      setTopRight({ lat: trLat, lon: trLon });
      setBottomLeft({ lat: blLat, lon: blLon });

      // Also add one fake icon to illustrate sending map & ship
      const list = icons && icons.length ? icons : await ensureIcons();
      console.log(list);
      let shipIcon: KonvaIcon | undefined = list.find((i) => /ship|boat|vessel/i.test(i.name));
      if (!shipIcon) shipIcon = pickRandomIcon(list);
      if (shipIcon) {
        await addShapes(
          [
            {
              type: "path",
              paths: createPathsFromSVG(shipIcon.content, 160, 160),
            },
          ],
          false,
          false,
          { x: 140, y: 140 }
        );
      }
      updateSnackbarAlert?.(
        `Imported test.png | TR(${trLat.toFixed(5)}, ${trLon.toFixed(5)}) BL(${blLat.toFixed(5)}, ${blLon.toFixed(5)})`,
        "success"
      );
    } catch (err) {
      updateSnackbarAlert?.(`Fake import ảnh lỗi: ${err}`, "error");
    }
  }, [addShapes, alignShape, setTopRight, setBottomLeft, ensureIcons, icons, updateSnackbarAlert]);

  return (
    <>
      <TooltipButton
        icon={<ImageTwoTone />}
        title={"Fake Import test.png"}
        onClick={onClickImportTestImage}
        disabled={loading}
      />
    </>
  );
});
