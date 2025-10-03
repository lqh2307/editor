import { IMAGE_STORAGE_URL } from "../../configs";
import axios, { AxiosResponse } from "axios";
import { SearchReportOption } from "./Types";

export async function searchReport(
  options: SearchReportOption
): Promise<AxiosResponse> {
  const { desc, controller, size, page, ...filters }: SearchReportOption =
    options;

  let url = `${IMAGE_STORAGE_URL}/reports/search?page[size]=${size ?? 9999}&page[page]=0${page ?? 0}`;

  for (const field in filters) {
    url += `&filter[${field}]=${filters[field]}`;
  }

  if (desc) {
    url += "&sort=-updated_at";
  }

  return await axios.get<undefined, AxiosResponse>(url, {
    responseType: "json",
    timeout: 300000,
    signal: controller?.signal,
  });
}
