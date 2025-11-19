import { IMAGE_PROCESS_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { AddFrameOption } from "./Types";

export async function addFrame(
  options: AddFrameOption
): Promise<AxiosResponse> {
  const { controller, ...option }: AddFrameOption = options;

  return await axios.post<AddFrameOption, AxiosResponse>(
    `${IMAGE_PROCESS_URL}/renders/add-frame`,
    option,
    {
      timeout: 300000,
      signal: controller?.signal,
    }
  );
}
