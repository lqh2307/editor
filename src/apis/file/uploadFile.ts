import { IMAGE_STORAGE_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { UploadFileOption } from "./Types";
import FormData from "form-data";

export async function uploadFile(
  options: UploadFileOption
): Promise<AxiosResponse> {
  const form: FormData = new FormData();
  form.append("file", options.blob, options.fileName);
  form.append("format", options.format);

  return await axios.post(`${IMAGE_STORAGE_URL}/files`, form, {
    timeout: 300000,
    signal: options.controller?.signal,
  });
}
