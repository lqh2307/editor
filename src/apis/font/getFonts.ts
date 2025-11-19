import axios, { AxiosResponse } from "axios";
import { BASE_URL } from "../../configs";
import { GetFontsOption } from "./Types";

export async function getFonts(
  options: GetFontsOption
): Promise<AxiosResponse> {
  return await axios.get<GetFontsOption, AxiosResponse>(
    `${BASE_URL}/assets/fonts/fonts.json`,
    {
      responseType: "json",
      timeout: 300000,
      signal: options.controller?.signal,
    }
  );
}
