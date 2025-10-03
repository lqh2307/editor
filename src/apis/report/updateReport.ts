import { IMAGE_STORAGE_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { UpdateReportOption } from "./Types";

export async function updateReport(
  options: UpdateReportOption
): Promise<AxiosResponse> {
  const { controller, ...option }: UpdateReportOption = options;

  return await axios.put<UpdateReportOption, AxiosResponse>(
    `${IMAGE_STORAGE_URL}/reports/${option.id}`,
    option,
    {
      responseType: "json",
      timeout: 300000,
      signal: controller?.signal,
    }
  );
}
