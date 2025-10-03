import { IMAGE_PROCESS_URL } from "../../configs";
import { RenderStyleJSONOption } from "./Types";
import axios, { AxiosResponse } from "axios";

export async function renderStyleJSON(
  options: RenderStyleJSONOption
): Promise<AxiosResponse> {
  return await axios.post<RenderStyleJSONOption, AxiosResponse>(
    `${IMAGE_PROCESS_URL}/renders/stylejson`,
    options.overlays,
    {
      timeout: 300000,
      signal: options.controller?.signal,
    }
  );
}
