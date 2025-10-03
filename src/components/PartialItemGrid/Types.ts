import { GridProps } from "react-window";

export type PartialItemGridProp = Omit<
  GridProps<any>,
  "columnCount" | "columnWidth" | "rowCount" | "rowHeight" | "cellProps"
> & {
  items: any[];
  renderColumn: number;
  renderRow: number;

  paddingX?: number;
  paddingY?: number;

  gapX?: number;
  gapY?: number;

  itemWidth: number;
  itemHeight: number;

  isLoading?: boolean;
  progress?: number;
  isDisplayProgress?: boolean;
};
