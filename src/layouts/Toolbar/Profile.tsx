import { Avatar, Box, Divider, Paper, Typography } from "@mui/material";
import { TooltipButton } from "../../components/TooltipButton";
import { PopperButton } from "../../components/PopperButton";
import { BasicDialog } from "../../components/BasicDialog";
import { useTranslation } from "react-i18next";
import React from "react";
import {
  LogoutTwoTone,
  PersonTwoTone,
  CloseTwoTone,
} from "@mui/icons-material";

export const ToolbarProfile = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const [isProfileOpen, setIsProfileOpen] = React.useState<boolean>(false);

  const profileHandler = React.useMemo(() => {
    return {
      open: (): void => {
        setIsProfileOpen(true);
      },
      close: (): void => {
        setIsProfileOpen(false);
      },
      onClose: (_: any, reason: "backdropClick" | "escapeKeyDown"): void => {
        if (reason === "backdropClick") {
          return;
        }

        setIsProfileOpen(false);
      },
    };
  }, []);

  const [isLogoutOpen, setIsLogoutOpen] = React.useState<boolean>(false);

  const logoutHandler = React.useMemo(() => {
    return {
      open: (): void => {
        setIsLogoutOpen(true);
      },
      cancel: (): void => {
        setIsLogoutOpen(false);
      },
      confirm: (): void => {
        setIsLogoutOpen(() => {
          close();

          return false;
        });
      },
      onClose: (_: any, reason: "backdropClick" | "escapeKeyDown"): void => {
        if (reason === "backdropClick") {
          return;
        }

        setIsLogoutOpen(false);
      },
    };
  }, []);

  const profileDialogTitle: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {t("toolBar.profile.children.profile.title")}

          <TooltipButton
            title={t("toolBar.profile.common.button.close")}
            onClick={profileHandler.close}
            icon={<CloseTwoTone fontSize="small" />}
            color={"error"}
          />
        </Box>
      );
    }, [t]);

  const profileDialogContent: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return <></>;
    }, [t]);

  const profileDialogAction: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <TooltipButton
          onClick={profileHandler.close}
          title={t("toolBar.profile.common.button.close")}
        >
          {t("toolBar.profile.common.button.close")}
        </TooltipButton>
      );
    }, [t]);

  const logoutDialogTitle: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {t("toolBar.profile.children.logout.title")}

          <TooltipButton
            onClick={logoutHandler.cancel}
            icon={<CloseTwoTone fontSize="small" />}
            color={"error"}
            title={t("toolBar.profile.common.button.close")}
          />
        </Box>
      );
    }, [t]);

  const logoutDialogContent: React.JSX.Element =
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
            {t("toolBar.profile.common.notification.content")}
          </Typography>
        </Box>
      );
    }, [t]);

  const logoutDialogAction: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <>
          <TooltipButton
            onClick={logoutHandler.cancel}
            title={t("toolBar.profile.common.button.cancel")}
          >
            {t("toolBar.profile.common.button.cancel")}
          </TooltipButton>

          <TooltipButton
            onClick={logoutHandler.confirm}
            title={t("toolBar.profile.common.button.confirm")}
          >
            {t("toolBar.profile.common.button.confirm")}
          </TooltipButton>
        </>
      );
    }, [t]);

  {
    /* Profile/Logout */
  }
  return (
    <>
      <PopperButton
        variant={"text"}
        title={t("toolBar.profile.title")}
        icon={
          <>
            <Avatar
              alt="Huy"
              src={""}
              sx={{
                marginRight: "0.25rem",
              }}
            />
            Huy
          </>
        }
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
          <TooltipButton
            icon={
              <>
                <PersonTwoTone
                  fontSize={"small"}
                  sx={{
                    marginRight: "0.25rem",
                  }}
                />
                {t("toolBar.profile.children.profile.title")}
              </>
            }
            title={t("toolBar.profile.children.profile.title")}
            onClick={profileHandler.open}
            sx={{
              justifyContent: "flex-start",
            }}
          />

          <TooltipButton
            icon={
              <>
                <LogoutTwoTone
                  fontSize={"small"}
                  sx={{
                    marginRight: "0.25rem",
                  }}
                />
                {t("toolBar.profile.children.logout.title")}
              </>
            }
            title={t("toolBar.profile.children.logout.title")}
            onClick={logoutHandler.open}
            color={"error"}
            sx={{
              justifyContent: "flex-start",
            }}
          />
        </Paper>
      </PopperButton>

      {/* Profile Dialog */}
      <BasicDialog
        maxWidth={"sm"}
        open={isProfileOpen}
        onClose={profileHandler.onClose}
        dialogTitle={profileDialogTitle}
        dialogContent={profileDialogContent}
        dialogAction={profileDialogAction}
      />

      {/* Logout Dialog */}
      <BasicDialog
        open={isLogoutOpen}
        onClose={logoutHandler.onClose}
        dialogTitle={logoutDialogTitle}
        dialogContent={logoutDialogContent}
        dialogAction={logoutDialogAction}
      />
    </>
  );
});
