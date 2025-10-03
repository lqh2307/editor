import { IMAGE_STORAGE_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { DeleteFileOption } from "../file";

export async function deleteImageList(
  options: DeleteFileOption
): Promise<AxiosResponse> {
  return await axios.delete<DeleteFileOption, AxiosResponse>(
    `${IMAGE_STORAGE_URL}/images/${options.id}`,
    {
      timeout: 300000,
      signal: options.controller?.signal,
    }
  );
}
