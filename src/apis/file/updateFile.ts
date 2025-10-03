import { IMAGE_STORAGE_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { UpdateFileOption } from "./Types";
import FormData from "form-data";

export async function updateFile(
  options: UpdateFileOption
): Promise<AxiosResponse> {
  const form: FormData = new FormData();
  form.append("file", options.blob, options.fileName);
  form.append("format", options.format);

  return await axios.put(`${IMAGE_STORAGE_URL}/files/${options.id}`, form, {
    timeout: 300000,
    signal: options.controller?.signal,
  });
}
