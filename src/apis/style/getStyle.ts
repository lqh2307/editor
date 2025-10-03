import { IMAGE_PROCESS_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { GetStyleOption } from "./Types";

export async function getStyle(
  options: GetStyleOption
): Promise<AxiosResponse> {
  return await axios.get<GetStyleOption, AxiosResponse>(
    options.url
      ? options.url
      : `${IMAGE_PROCESS_URL}/styles/${options.id}/style.json?raw=${options.raw ?? "false"}&compression=${options.compression ?? "false"}`,
    {
      responseType: "json",
      timeout: 300000,
      signal: options.controller?.signal,
    }
  );
}
