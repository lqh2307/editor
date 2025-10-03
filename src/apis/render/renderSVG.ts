import { IMAGE_PROCESS_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { RenderSVGOption } from "./Types";

export async function renderSVG(
  options: RenderSVGOption
): Promise<AxiosResponse> {
  return await axios.post<RenderSVGOption, AxiosResponse>(
    `${IMAGE_PROCESS_URL}/renders/svg`,
    options.overlays,
    {
      timeout: 300000,
      signal: options.controller?.signal,
    }
  );
}
