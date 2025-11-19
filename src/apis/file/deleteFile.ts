import { IMAGE_STORAGE_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { DeleteFileOption } from "./Types";

export async function deleteFile(
  options: DeleteFileOption
): Promise<AxiosResponse> {
  return await axios.delete<DeleteFileOption, AxiosResponse>(
    `${IMAGE_STORAGE_URL}/files/${options.id}`,
    {
      timeout: 300000,
      signal: options.controller?.signal,
    }
  );
}
