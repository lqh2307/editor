import { KonvaIcon } from "../../types/Konva";
import { Report } from "../../apis/report";
import { Image } from "../../apis/image";

export type ItemInfo = {
  renderColumn: number;
  renderRow: number;
  itemSize: number;
  itemWidth: number;
  itemHeight: number;
};

export type IconInfo = {
  isLoading: boolean;
  icons: KonvaIcon[];
};

export type ImageInfo = {
  isLoading: boolean;
  images: Image[];
};

export type LinkInfo = {
  isLoading: boolean;
  isOpen: boolean;
  link: string;
};

export type ReportInfo = {
  isLoading: boolean;
  reports: Report[];
};
