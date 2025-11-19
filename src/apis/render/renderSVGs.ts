import { IMAGE_PROCESS_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { RenderSVGsOption } from "./Types";

export async function renderSVGs(
  options: RenderSVGsOption
): Promise<AxiosResponse> {
  return await axios.post<RenderSVGsOption, AxiosResponse>(
    `${IMAGE_PROCESS_URL}/renders/svgs`,
    options.overlays,
    {
      timeout: 300000,
      signal: options.controller?.signal,
    }
  );
}
