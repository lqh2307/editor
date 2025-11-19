export type Report = {
  id?: string;
  name?: string;
  json_file_id?: string;
  image_file_id?: string;
  type?: number;
};

export type CreateReportOption = {
  controller?: AbortController;

  id?: string;
  name: string;
  json_file_id: string;
  image_file_id?: string;
  type: number;
};

export type UpdateReportOption = {
  controller?: AbortController;

  id: string;
  name: string;
  json_file_id: string;
  image_file_id: string;
  type: number;
};

export type GetReportOption = {
  controller?: AbortController;

  id: string;
};

export type DeleteReportOption = {
  controller?: AbortController;

  id: string;
};

export type SearchReportOption = {
  controller?: AbortController;

  desc?: boolean;
  size?: number;
  page?: number;

  id?: string;
  name?: string;
  json_file_id?: string;
  image_file_id?: string;
  type?: number;
};
