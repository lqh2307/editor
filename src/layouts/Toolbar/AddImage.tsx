import { useShapesContext, useStageContext } from "../../contexts";
import { PartialItemGrid } from "../../components/PartialItemGrid";
import { TooltipButton } from "../../components/TooltipButton";
import { PopperButton } from "../../components/PopperButton";
import { LoadingImage } from "../../components/LoadingImage";
import { PhotoLibraryTwoTone } from "@mui/icons-material";
import { Image, searchImage } from "../../apis/image";
import { IMAGE_STORAGE_URL } from "../../configs";
import { CellComponentProps } from "react-window";
import { KonvaDragDrop } from "../../types/Konva";
import { useTranslation } from "react-i18next";
import { ImageInfo, ItemInfo } from "./Types";
import { AxiosResponse } from "axios";
import { Box } from "@mui/material";
import React from "react";

export const ToolbarAddImage = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { getStageCenter, updateSnackbarAlert } = useStageContext();

  const { addShapes } = useShapesContext();

  const addImageHandler = React.useCallback(
    async (value: string): Promise<void> => {
      try {
        const data: KonvaDragDrop = JSON.parse(value) as KonvaDragDrop;

        await addShapes(
          [
            {
              type: data.type,
              imageURL: data.imageURL,
              resolution: data.resolution,
            },
          ],
          false,
          false,
          getStageCenter()
        );
      } catch (error) {
        updateSnackbarAlert(
          `${t("toolBar.addShape.common.snackBarAlert.error")} ${error}`,
          "error"
        );
      }
    },
    [t, addShapes, getStageCenter, updateSnackbarAlert]
  );

  const dragImageHandler = React.useCallback(
    (e: React.DragEvent<HTMLButtonElement>): void => {
      e.dataTransfer?.setData("data", e.currentTarget?.value);
    },
    []
  );

  const imageInitRef = React.useRef<ImageInfo>({
    isLoading: false,
    images: [],
  });

  const [imageInfo, setImageInfo] = React.useState<ImageInfo>(
    imageInitRef.current
  );

  const imageConfigRef = React.useRef<ItemInfo>({
    renderColumn: 1,
    renderRow: 1,
    itemSize: 176,
    itemWidth: 192,
    itemHeight: 184,
  });

  const fetchImageHandler = React.useCallback(async (): Promise<void> => {
    try {
      setImageInfo((prev) => ({
        ...prev,
        isLoading: true,
      }));

      const response: AxiosResponse = await searchImage({
        desc: true,
      });

      setImageInfo({
        isLoading: false,
        images: response.data as Image[],
      });
    } catch (error) {
      setImageInfo(imageInitRef.current);

      updateSnackbarAlert(
        `${t("toolBar.addImage.common.snackBarAlert.error")} ${error}`,
        "error"
      );
    }
  }, [t, updateSnackbarAlert]);

  const ImageCell = React.useCallback(
    (prop: CellComponentProps): React.JSX.Element => {
      const index: number =
        prop.rowIndex * imageConfigRef.current.renderColumn + prop.columnIndex;
      if (index >= imageInfo.images.length) {
        return;
      }

      const image: Image = imageInfo.images[index];
      const imageURL: string = `${IMAGE_STORAGE_URL}/files/${image.file_id}/download`;

      return (
        <Box
          style={prop.style}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TooltipButton
            icon={
              <LoadingImage
                alt={image.name}
                src={imageURL}
                width={imageConfigRef.current.itemSize}
                height={imageConfigRef.current.itemSize}
                draggable={false}
                fallbackSrc={"./assets/images/placeholder.png"}
              />
            }
            value={JSON.stringify({
              type: "image",
              imageURL: imageURL,
              resolution: image.resolution,
            })}
            title={image.name}
            sx={{
              minWidth: imageConfigRef.current.itemWidth,
              minHeight: imageConfigRef.current.itemHeight,
            }}
            onClick={addImageHandler}
            draggable={true}
            onDragStart={dragImageHandler}
          />
        </Box>
      );
    },
    [imageInfo.images, addImageHandler]
  );

  {
    /* Add Image */
  }
  return (
    <PopperButton
      icon={<PhotoLibraryTwoTone />}
      title={t("toolBar.addImage.title")}
      onClick={fetchImageHandler}
    >
      <PartialItemGrid
        isLoading={imageInfo.isLoading}
        cellComponent={ImageCell}
        items={imageInfo.images}
        renderColumn={imageConfigRef.current.renderColumn}
        renderRow={imageConfigRef.current.renderRow}
        itemWidth={imageConfigRef.current.itemWidth}
        itemHeight={imageConfigRef.current.itemHeight}
      />
    </PopperButton>
  );
});
