import axios, { AxiosResponse } from "axios";
import { BASE_URL } from "../../configs";
import { GetIconsOption } from "./Types";

export async function getIcons(
  options: GetIconsOption
): Promise<AxiosResponse> {
  const resp = await axios.get<GetIconsOption, AxiosResponse>(
    `${BASE_URL}/assets/icons/icons-khqs.json`,
    {
      responseType: "json",
      timeout: 300000,
      signal: options.controller?.signal,
    }
  );

  try {
    const raw = resp.data as Array<{ path: string; description?: string; category?: string }>;
    if (!Array.isArray(raw)) {
      return resp;
    }

    const encodePath = (p: string): string =>
      p
        .split("/")
        .map((seg) => encodeURIComponent(seg))
        .join("/");

    const icons = await Promise.all(
      raw.map(async (item) => {
        const url = `${BASE_URL}/assets/${encodePath(item.path)}`;
        const svgResp = await axios.get<string>(url, {
          responseType: "text",
          timeout: 300000,
          signal: options.controller?.signal,
        });

        const nameFromPath = item.path.split("/").pop() || "icon";
        const baseName = nameFromPath.replace(/\.svg$/i, "");

        return {
          name: item.description || baseName,
          content: svgResp.data,
        };
      })
    );

    (resp as any).data = icons;
  } catch (_err) {
    // If transformation fails, return original response
    return resp;
  }

  return resp;
}
