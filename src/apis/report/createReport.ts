import { IMAGE_STORAGE_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { CreateReportOption } from "./Types";

export async function createReport(
  options: CreateReportOption
): Promise<AxiosResponse> {
  const { controller, ...option }: CreateReportOption = options;

  return await axios.post<CreateReportOption, AxiosResponse>(
    `${IMAGE_STORAGE_URL}/reports`,
    option,
    {
      responseType: "json",
      timeout: 300000,
      signal: controller?.signal,
    }
  );
}
