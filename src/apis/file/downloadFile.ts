import { IMAGE_STORAGE_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { DownloadFileOption } from "./Types";

export async function downloadFile(
  options: DownloadFileOption
): Promise<AxiosResponse> {
  return await axios.get<string, AxiosResponse>(
    `${IMAGE_STORAGE_URL}/files/${options.id}/download`,
    {
      timeout: 300000,
      signal: options.controller?.signal,
      responseType: options.responseType,
    }
  );
}
