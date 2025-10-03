import { IMAGE_STORAGE_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { GetReportOption } from "./Types";

export async function getReport(
  options: GetReportOption
): Promise<AxiosResponse> {
  return await axios.get<GetReportOption, AxiosResponse>(
    `${IMAGE_STORAGE_URL}/reports/${options.id}`,
    {
      responseType: "json",
      timeout: 300000,
      signal: options.controller?.signal,
    }
  );
}
