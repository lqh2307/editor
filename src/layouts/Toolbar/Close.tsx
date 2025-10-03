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

  const [isSettingOpen, setIsSettingOpen] = React.useState<boolean>(false);

  const handler = React.useMemo(() => {
    return {
      open: (): void => {
        setIsSettingOpen(true);
      },
      cancel: (): void => {
        setIsSettingOpen(false);
      },
      confirm: (): void => {
        setIsSettingOpen(() => {
          close();

          return false;
        });
      },
      onClose: (_: any, reason: "backdropClick" | "escapeKeyDown"): void => {
        if (reason === "backdropClick") {
          return;
        }

        setIsSettingOpen(false);
      },
    };
  }, []);

  const pressESCButtonHandler = React.useCallback((): void => {
    setFreeDrawingMode((prev) => {
      if (prev) {
        return undefined;
      } else {
        updateSelectedIds(undefined, true);

        return prev;
      }
    });
  }, [updateSelectedIds, setFreeDrawingMode]);

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
          {t("toolBar.close.children.notification.title")}

          <TooltipButton
            onClick={handler.cancel}
            icon={<CloseTwoTone fontSize="small" />}
            color={"error"}
            title={t("toolBar.close.common.button.close")}
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

          <Typography sx={{ fontSize: 12 }}>
            {t("toolBar.close.children.notification.content")}
          </Typography>
        </Box>
      );
    }, [t]);

  const dialogAction: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <>
          <TooltipButton
            onClick={handler.cancel}
            title={t("toolBar.close.common.button.cancel")}
          >
            {t("toolBar.close.common.button.cancel")}
          </TooltipButton>

          <TooltipButton
            onClick={handler.confirm}
            title={t("toolBar.close.common.button.confirm")}
          >
            {t("toolBar.close.common.button.confirm")}
          </TooltipButton>
        </>
      );
    }, [t]);

  useDebounceHotKey({
    keys: ["esc", "escape"],
    callback: (e) => {
      e.preventDefault();

      pressESCButtonHandler();
    },
    deps: [pressESCButtonHandler],
  });

  useDebounceHotKey({
    keys: "ctrl+w",
    callback: (e) => {
      e.preventDefault();

      handler.open();
    },
    deps: [handler.open],
  });

  return (
    <>
      {/* Close */}
      <ButtonGroup variant={"contained"} size={"small"}>
        <TooltipButton
          icon={<CloseTwoTone />}
          title={t("toolBar.close.title")}
          onClick={handler.open}
          color={"error"}
        />
      </ButtonGroup>

      {/* Close Dialog */}
      <BasicDialog
        open={isSettingOpen}
        onClose={handler.onClose}
        dialogTitle={dialogTitle}
        dialogContent={dialogContent}
        dialogAction={dialogAction}
      />
    </>
  );
});
