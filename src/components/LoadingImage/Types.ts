import { BoxProps } from "@mui/material";

export type LoadingImageProp = BoxProps & {
  fallbackSrc?: string;
  src?: string;
  alt?: string;
  display?: string;

  isLoading?: boolean;
  progress?: number;
  isDisplayProgress?: boolean;
  backgroundColor?: string;
};
