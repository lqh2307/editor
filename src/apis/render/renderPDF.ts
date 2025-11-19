import { IMAGE_PROCESS_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { RenderPDFOption } from "./Types";

export async function renderPDF(
  options: RenderPDFOption
): Promise<AxiosResponse> {
  const { controller, ...option }: RenderPDFOption = options;

  return await axios.post<RenderPDFOption, AxiosResponse>(
    `${IMAGE_PROCESS_URL}/renders/pdf`,
    option,
    {
      timeout: 300000,
      signal: controller?.signal,
    }
  );
}
