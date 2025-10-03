import { LogoutTwoTone, PersonTwoTone } from "@mui/icons-material";
import { TooltipButton } from "../../components/TooltipButton";
import { PopperButton } from "../../components/PopperButton";
import { useTranslation } from "react-i18next";
import { Avatar, Paper } from "@mui/material";
import React from "react";

export const ToolbarProfile = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  {
    /* Profile/Logout */
  }
  return (
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
          sx={{
            justifyContent: "flex-start",
          }}
        />
      </Paper>
    </PopperButton>
  );
});
