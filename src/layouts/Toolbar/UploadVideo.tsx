import { ImportFileButton } from "../../components/ImportFileButton";
import { useShapesContext, useStageContext } from "../../contexts";
import { TooltipButton } from "../../components/TooltipButton";
import { PopperButton } from "../../components/PopperButton";
import { BasicDialog } from "../../components/BasicDialog";
import { TextInput } from "../../components/TextInput";
import { Divider, Paper, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LinkInfo } from "./Types";
import React from "react";
import {
  SmartDisplayTwoTone,
  DevicesTwoTone,
  CloseTwoTone,
  LinkTwoTone,
} from "@mui/icons-material";

export const ToolbarUploadVideo = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { getStageCenter, updateSnackbarAlert } = useStageContext();

  const { addShapes } = useShapesContext();

  const linkInitRef = React.useRef<LinkInfo>({
    isLoading: false,
    isOpen: false,
    link: undefined,
  });

  const [videoFromLinkInfo, setVideoFromLinkInfo] = React.useState<LinkInfo>(
    linkInitRef.current
  );

  const videoFromLinkHandler = React.useMemo(() => {
    return {
      open: (): void => {
        setVideoFromLinkInfo({
          ...linkInitRef.current,
          isOpen: true,
        });
      },
      close: (): void => {
        setVideoFromLinkInfo(linkInitRef.current);
      },
      onClose: (_: any, reason: "backdropClick" | "escapeKeyDown"): void => {
        if (reason === "backdropClick") {
          return;
        }

        setVideoFromLinkInfo(linkInitRef.current);
      },
      changeLink: (value: string): void => {
        setVideoFromLinkInfo((prev) => ({
          ...prev,
          link: value,
        }));
      },
    };
  }, []);

  const uploadVideoFromDeviceHandler = React.useCallback(
    async (file: File): Promise<void> => {
      try {
        updateSnackbarAlert(
          t("toolBar.uploadVideo.common.snackBarAlert.uploading"),
          "warning"
        );

        await addShapes(
          [
            {
              type: "video",
              imageBlob: file,
            },
          ],
          false,
          undefined,
          getStageCenter()
        );
      } catch (error) {
        updateSnackbarAlert(
          `${t("toolBar.uploadVideo.common.snackBarAlert.error")} ${error}`,
          "error"
        );
      }
    },
    [addShapes, getStageCenter, updateSnackbarAlert]
  );

  const uploadVideoFromLinkHandler =
    React.useCallback(async (): Promise<void> => {
      try {
        setVideoFromLinkInfo((prev) => ({
          ...prev,
          isLoading: true,
        }));

        updateSnackbarAlert(
          t("toolBar.uploadVideo.common.snackBarAlert.uploading"),
          "warning"
        );

        await addShapes(
          [
            {
              type: "video",
              imageURL: videoFromLinkInfo.link,
            },
          ],
          false,
          false,
          getStageCenter()
        );
      } catch (error) {
        updateSnackbarAlert(
          `${t("toolBar.uploadVideo.common.snackBarAlert.error")} ${error}`,
          "error"
        );
      } finally {
        setVideoFromLinkInfo(linkInitRef.current);
      }
    }, [addShapes, videoFromLinkInfo, getStageCenter, updateSnackbarAlert]);

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
          {t("toolBar.uploadVideo.title")}

          <TooltipButton
            title={t("toolBar.uploadVideo.common.button.close")}
            onClick={videoFromLinkHandler.close}
            icon={<CloseTwoTone fontSize="small" />}
            color={"error"}
          />
        </Box>
      );
    }, []);

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
              "toolBar.uploadVideo.children.fromLink.children.link.title"
            )}
            value={videoFromLinkInfo.link}
            onChange={videoFromLinkHandler.changeLink}
            required={true}
          />
        </Box>
      );
    }, [videoFromLinkInfo.link]);

  const dialogAction: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <TooltipButton
          onClick={uploadVideoFromLinkHandler}
          disabled={videoFromLinkInfo.isLoading || !videoFromLinkInfo.link}
          title={t("toolBar.uploadVideo.common.button.upload")}
        >
          {t("toolBar.uploadVideo.common.button.upload")}
        </TooltipButton>
      );
    }, [uploadVideoFromLinkHandler]);

  return (
    <>
      {/* Upload Video (From Device/From Link) */}
      <PopperButton
        icon={<SmartDisplayTwoTone />}
        title={t("toolBar.uploadVideo.title")}
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
                {t("toolBar.uploadVideo.children.fromDevice.title")}
              </>
            }
            title={t("toolBar.uploadVideo.children.fromDevice.title")}
            acceptMimeType={"video/*"}
            onFileLoaded={uploadVideoFromDeviceHandler}
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
            onClick={videoFromLinkHandler.open}
            sx={{
              justifyContent: "flex-start",
            }}
          />
        </Paper>
      </PopperButton>

      {/* Upload Video From Link Dialog */}
      <BasicDialog
        open={videoFromLinkInfo.isOpen}
        onClose={videoFromLinkHandler.onClose}
        dialogTitle={dialogTitle}
        dialogContent={dialogContent}
        dialogAction={dialogAction}
      />
    </>
  );
});
