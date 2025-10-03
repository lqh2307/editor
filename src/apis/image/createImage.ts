import { IMAGE_STORAGE_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { CreateImageOption } from "./Types";

export async function createImage(
  options: CreateImageOption
): Promise<AxiosResponse> {
  const { controller, ...option }: CreateImageOption = options;

  return await axios.post<CreateImageOption, AxiosResponse>(
    `${IMAGE_STORAGE_URL}/images`,
    option,
    {
      responseType: "json",
      timeout: 300000,
      signal: controller?.signal,
    }
  );
}
