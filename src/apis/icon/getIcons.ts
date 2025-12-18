import axios, { AxiosResponse } from "axios";
import { BASE_URL } from "../../configs";
import { GetIconsOption } from "./Types";

export async function getIcons(
  options: GetIconsOption
): Promise<AxiosResponse> {
  return await axios.get<GetIconsOption, AxiosResponse>(
    `${BASE_URL}/assets/icons/${options.type}.json`,
    {
      responseType: "json",
      timeout: 300000,
      signal: options.controller?.signal,
    }
  );
}
