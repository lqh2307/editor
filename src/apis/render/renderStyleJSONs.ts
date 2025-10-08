import { IMAGE_PROCESS_URL } from "../../configs";
import { RenderStyleJSONsOption } from "./Types";
import axios, { AxiosResponse } from "axios";

export async function renderStyleJSONs(
  options: RenderStyleJSONsOption
): Promise<AxiosResponse> {
  return await axios.post<RenderStyleJSONsOption, AxiosResponse>(
    `${IMAGE_PROCESS_URL}/renders/stylejsons`,
    options.overlays,
    {
      timeout: 300000,
      signal: options.controller?.signal,
    }
  );
}
