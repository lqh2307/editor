import { Format } from "../../types/Common";
import { ResponseType } from "axios";

export type DownloadFileOption = {
  controller?: AbortController;

  id: string;
  responseType?: ResponseType;
};

export type DeleteFileOption = {
  controller?: AbortController;

  id: string;
};

export type UploadFileOption = {
  controller?: AbortController;

  id?: string;
  blob: Blob;
  fileName: string;
  format?: Format;
};

export type UpdateFileOption = {
  controller?: AbortController;

  id: string;
  blob: Blob;
  fileName?: string;
  format?: Format;
};
