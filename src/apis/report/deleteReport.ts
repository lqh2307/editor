import { IMAGE_STORAGE_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { DeleteReportOption } from "./Types";

export async function deleteReport(
  options: DeleteReportOption
): Promise<AxiosResponse> {
  return await axios.delete<DeleteReportOption, AxiosResponse>(
    `${IMAGE_STORAGE_URL}/reports/${options.id}`,
    {
      timeout: 300000,
      signal: options.controller?.signal,
    }
  );
}
