import { useFreeDrawingContext, useShapesContext } from "../../contexts";
import { ButtonGroup, Typography, Divider, Box } from "@mui/material";
import { useDebounceHotKey } from "../../hooks/useDebounceHotKey";
import { TooltipButton } from "../../components/TooltipButton";
import { BasicDialog } from "../../components/BasicDialog";
import { CloseTwoTone } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import React from "react";

export const ToolbarClose = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { setFreeDrawingMode } = useFreeDrawingContext();

  const { updateSelectedIds } = useShapesContext();

  const [isCloseOpen, setIsCloseOpen] = React.useState<boolean>(false);

  const closeHandler = React.useMemo(() => {
    return {
      open: (): void => {
        setIsCloseOpen(true);
      },
      cancel: (): void => {
        setIsCloseOpen(false);
      },
      confirm: (): void => {
        setIsCloseOpen(() => {
          close();

          return false;
        });
      },
      onClose: (_: any, reason: "backdropClick" | "escapeKeyDown"): void => {
        if (reason === "backdropClick") {
          return;
        }

        setIsCloseOpen(false);
      },
    };
  }, []);

  const pressESCButtonHandler = React.useCallback((): void => {
    setFreeDrawingMode((prev) => {
      if (prev) {
        return undefined;
      } else {
        // Reset selected ids
        updateSelectedIds(undefined, true);

        return prev;
      }
    });
  }, [updateSelectedIds, setFreeDrawingMode]);

  const closeDialogTitle: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {t("toolBar.close.children.close.title")}

          <TooltipButton
            onClick={closeHandler.cancel}
            icon={<CloseTwoTone fontSize="small" />}
            color={"error"}
            title={t("toolBar.close.common.button.close")}
          />
        </Box>
      );
    }, [t]);

  const closeDialogContent: React.JSX.Element =
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

          <Typography sx={{ fontSize: 12 }}>
            {t("toolBar.close.common.notification.content")}
          </Typography>
        </Box>
      );
    }, [t]);

  const closeDialogAction: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <>
          <TooltipButton
            onClick={closeHandler.cancel}
            title={t("toolBar.close.common.button.cancel")}
          >
            {t("toolBar.close.common.button.cancel")}
          </TooltipButton>

          <TooltipButton
            onClick={closeHandler.confirm}
            title={t("toolBar.close.common.button.confirm")}
          >
            {t("toolBar.close.common.button.confirm")}
          </TooltipButton>
        </>
      );
    }, [t]);

  useDebounceHotKey({
    keys: ["esc", "escape"],
    callback: () => {
      pressESCButtonHandler();
    },
    deps: [pressESCButtonHandler],
  });

  useDebounceHotKey({
    keys: "ctrl+w",
    callback: () => {
      closeHandler.open();
    },
    deps: [closeHandler.open],
  });

  return (
    <>
      {/* Close */}
      <ButtonGroup variant={"contained"} size={"small"}>
        <TooltipButton
          icon={<CloseTwoTone />}
          title={t("toolBar.close.title")}
          onClick={closeHandler.open}
          color={"error"}
        />
      </ButtonGroup>

      {/* Close Dialog */}
      <BasicDialog
        open={isCloseOpen}
        onClose={closeHandler.onClose}
        dialogTitle={closeDialogTitle}
        dialogContent={closeDialogContent}
        dialogAction={closeDialogAction}
      />
    </>
  );
});
