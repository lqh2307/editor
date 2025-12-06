import { ImportFileButton } from "../../components/ImportFileButton";
import { useShapesContext, useStageContext } from "../../contexts";
import { TooltipButton } from "../../components/TooltipButton";
import { PopperButton } from "../../components/PopperButton";
import { BasicDialog } from "../../components/BasicDialog";
import { TextInput } from "../../components/TextInput";
import { Paper, Divider, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LinkInfo } from "./Types";
import React from "react";
import {
  DevicesTwoTone,
  CloseTwoTone,
  ImageTwoTone,
  LinkTwoTone,
} from "@mui/icons-material";

export const ToolbarUploadImage = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { getStageCenter, updateSnackbarAlert } = useStageContext();

  const { addShapes } = useShapesContext();

  const linkInitRef = React.useRef<LinkInfo>({
    isLoading: false,
    isOpen: false,
    link: undefined,
  });

  const [imageFromLinkInfo, setImageFromLinkInfo] = React.useState<LinkInfo>(
    linkInitRef.current
  );

  const imageFromLinkHandler = React.useMemo(() => {
    return {
      open: (): void => {
        setImageFromLinkInfo({
          ...linkInitRef.current,
          isOpen: true,
        });
      },
      close: (): void => {
        setImageFromLinkInfo(linkInitRef.current);
      },
      onClose: (_: any, reason: "backdropClick" | "escapeKeyDown"): void => {
        if (reason === "backdropClick") {
          return;
        }

        setImageFromLinkInfo(linkInitRef.current);
      },
      changeLink: (value: string): void => {
        setImageFromLinkInfo((prev) => ({
          ...prev,
          link: value,
        }));
      },
    };
  }, []);

  const uploadImageFromDeviceHandler = React.useCallback(
    async (file: File): Promise<void> => {
      try {
        updateSnackbarAlert(
          t("toolBar.uploadImage.common.snackBarAlert.uploading"),
          "warning"
        );

        await addShapes(
          [
            {
              type: "image",
              imageBlob: file,
            },
          ],
          false,
          undefined,
          getStageCenter()
        );
      } catch (error) {
        updateSnackbarAlert(
          `${t("toolBar.uploadImage.common.snackBarAlert.error")} ${error}`,
          "error"
        );
      }
    },
    [addShapes, getStageCenter, updateSnackbarAlert]
  );

  const uploadImageFromLinkHandler =
    React.useCallback(async (): Promise<void> => {
      try {
        setImageFromLinkInfo((prev) => ({
          ...prev,
          isLoading: true,
        }));

        updateSnackbarAlert(
          t("toolBar.uploadImage.common.snackBarAlert.uploading"),
          "warning"
        );

        await addShapes(
          [
            {
              type: "image",
              imageURL: imageFromLinkInfo.link,
            },
          ],
          false,
          false,
          getStageCenter()
        );
      } catch (error) {
        updateSnackbarAlert(
          `${t("toolBar.uploadImage.common.snackBarAlert.error")} ${error}`,
          "error"
        );
      } finally {
        setImageFromLinkInfo(linkInitRef.current);
      }
    }, [addShapes, imageFromLinkInfo, getStageCenter, updateSnackbarAlert]);

  const dialogTitle: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {t("toolBar.uploadImage.title")}

          <TooltipButton
            title={t("toolBar.uploadImage.common.button.close")}
            onClick={imageFromLinkHandler.close}
            icon={<CloseTwoTone fontSize="small" />}
            color={"error"}
          />
        </Box>
      );
    }, [t]);

  const dialogContent: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Divider />

          <TextInput
            label={t(
              "toolBar.uploadImage.children.fromLink.children.link.title"
            )}
            value={imageFromLinkInfo.link}
            onChange={imageFromLinkHandler.changeLink}
            required={true}
          />
        </Box>
      );
    }, [imageFromLinkInfo.link]);

  const dialogAction: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <TooltipButton
          onClick={uploadImageFromLinkHandler}
          disabled={imageFromLinkInfo.isLoading || !imageFromLinkInfo.link}
          title={t("toolBar.uploadImage.common.button.upload")}
        >
          {t("toolBar.uploadImage.common.button.upload")}
        </TooltipButton>
      );
    }, [uploadImageFromLinkHandler]);

  return (
    <>
      {/* Upload Image (From Device/From Link) */}
      <PopperButton
        icon={<ImageTwoTone />}
        title={t("toolBar.uploadImage.title")}
      >
        <Paper
          elevation={4}
          sx={{
            padding: "0.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <ImportFileButton
            icon={
              <>
                <DevicesTwoTone
                  fontSize={"small"}
                  sx={{
                    marginRight: "0.25rem",
                  }}
                />
                {t("toolBar.uploadImage.children.fromDevice.title")}
              </>
            }
            title={t("toolBar.uploadImage.children.fromDevice.title")}
            acceptMimeType={"image/*"}
            onFileLoaded={uploadImageFromDeviceHandler}
            sx={{
              justifyContent: "flex-start",
            }}
          />

          <TooltipButton
            icon={
              <>
                <LinkTwoTone
                  fontSize={"small"}
                  sx={{
                    marginRight: "0.25rem",
                  }}
                />
                {t("toolBar.uploadImage.children.fromLink.title")}
              </>
            }
            title={t("toolBar.uploadImage.children.fromLink.title")}
            onClick={imageFromLinkHandler.open}
            sx={{
              justifyContent: "flex-start",
            }}
          />
        </Paper>
      </PopperButton>

      {/* Upload Image From Link Dialog */}
      <BasicDialog
        open={imageFromLinkInfo.isOpen}
        onClose={imageFromLinkHandler.onClose}
        dialogTitle={dialogTitle}
        dialogContent={dialogContent}
        dialogAction={dialogAction}
      />
    </>
  );
});
