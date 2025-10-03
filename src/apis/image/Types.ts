import { Size } from "../../types/Common";

export type Image = {
  id?: string;
  name?: string;
  resolution?: Size;
  file_id?: string;
};

export type DeleteImageOption = {
  controller?: AbortController;

  id: string;
};

export type CreateImageOption = {
  controller?: AbortController;

  id?: string;
  name: string;
  resolution?: Size;
  file_id: string;
};

export type SearchImageOption = {
  controller?: AbortController;

  desc?: boolean;
  size?: number;
  page?: number;

  id?: string;
  name?: string;
  resolution?: Size;
  file_id?: string;
};
