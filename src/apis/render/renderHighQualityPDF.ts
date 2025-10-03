import { RenderHighQualityPDFOption } from "./Types";
import { IMAGE_PROCESS_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";

export async function renderHighQualityPDF(
  options: RenderHighQualityPDFOption
): Promise<AxiosResponse> {
  const { controller, ...option }: RenderHighQualityPDFOption = options;

  return await axios.post<RenderHighQualityPDFOption, AxiosResponse>(
    `${IMAGE_PROCESS_URL}/renders/high-quality-pdf`,
    option,
    {
      timeout: 300000,
      signal: controller?.signal,
    }
  );
}
