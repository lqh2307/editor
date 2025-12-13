import translation from "../../locales/english/translation.json";
import { TooltipButton } from "../../components/TooltipButton";
import { PopperButton } from "../../components/PopperButton";
import { BasicDialog } from "../../components/BasicDialog";
import { useTranslation } from "react-i18next";
import React from "react";
import {
  TipsAndUpdatesTwoTone,
  ExpandMoreTwoTone,
  CloseTwoTone,
  HelpTwoTone,
  InfoTwoTone,
} from "@mui/icons-material";
import {
  AccordionSummary,
  AccordionDetails,
  Typography,
  Accordion,
  Paper,
  Box,
} from "@mui/material";

export const ToolbarHelp = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const [isGuideOpen, setIsGuideOpen] = React.useState<boolean>(false);

  const guideHandler = React.useMemo(() => {
    return {
      open: (): void => {
        setIsGuideOpen(true);
      },
      close: (): void => {
        setIsGuideOpen(false);
      },
      onClose: (_: any, reason: "backdropClick" | "escapeKeyDown"): void => {
        if (reason === "backdropClick") {
          return;
        }

        setIsGuideOpen(false);
      },
    };
  }, []);

  const [isAboutOpen, setIsAboutOpen] = React.useState<boolean>(false);

  const aboutHandler = React.useMemo(() => {
    return {
      open: (): void => {
        setIsAboutOpen(true);
      },
      close: (): void => {
        setIsAboutOpen(false);
      },
      onClose: (_: any, reason: "backdropClick" | "escapeKeyDown"): void => {
        if (reason === "backdropClick") {
          return;
        }

        setIsAboutOpen(false);
      },
    };
  }, []);

  const guideDialogTitle: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {t("toolBar.help.children.guide.title")}

          <TooltipButton
            title={t("toolBar.help.common.button.close")}
            onClick={guideHandler.close}
            icon={<CloseTwoTone fontSize="small" />}
            color={"error"}
          />
        </Box>
      );
    }, [t]);

  const guideDialogContent: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <>
          {/* Manipulation */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
              <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                {t("toolBar.help.children.guide.children.manipulation.title")}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Typography sx={{ fontSize: 12 }}>
                {t(
                  "toolBar.help.children.guide.children.manipulation.children.add.title"
                )}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {t(
                  "toolBar.help.children.guide.children.manipulation.children.add.content"
                )}
              </Typography>

              <Typography sx={{ fontSize: 12 }}>
                {t(
                  "toolBar.help.children.guide.children.manipulation.children.edit.title"
                )}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {t(
                  "toolBar.help.children.guide.children.manipulation.children.edit.content"
                )}
              </Typography>

              <Typography sx={{ fontSize: 12 }}>
                {t(
                  "toolBar.help.children.guide.children.manipulation.children.group.title"
                )}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {t(
                  "toolBar.help.children.guide.children.manipulation.children.group.content"
                )}
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Save */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
              <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                {t("toolBar.help.children.guide.children.save.title")}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: 12 }}>
                {t("toolBar.help.children.guide.children.save.content")}
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Template */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
              <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                {t("toolBar.help.children.guide.children.template.title")}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: 12 }}>
                {t("toolBar.help.children.guide.children.template.content")}
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Shotcut */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
              <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                {t("toolBar.help.children.guide.children.shotcut.title")}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Typography sx={{ fontSize: 12 }}>
                {t(
                  "toolBar.help.children.guide.children.shotcut.children.general.title"
                )}
              </Typography>

              {translation.toolBar.help.children.guide.children.shotcut.children.general.content.map(
                (_, idx) => {
                  return (
                    <Typography
                      key={idx}
                      sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
                    >
                      {t(
                        `toolBar.help.children.guide.children.shotcut.children.general.content.${idx}`
                      )}
                    </Typography>
                  );
                }
              )}

              <Typography sx={{ fontSize: 12 }}>
                {t(
                  "toolBar.help.children.guide.children.shotcut.children.history.title"
                )}
              </Typography>

              {translation.toolBar.help.children.guide.children.shotcut.children.history.content.map(
                (_, idx) => {
                  return (
                    <Typography
                      key={idx}
                      sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
                    >
                      {t(
                        `toolBar.help.children.guide.children.shotcut.children.history.content.${idx}`
                      )}
                    </Typography>
                  );
                }
              )}

              <Typography sx={{ fontSize: 12 }}>
                {t(
                  "toolBar.help.children.guide.children.shotcut.children.text.title"
                )}
              </Typography>

              {translation.toolBar.help.children.guide.children.shotcut.children.text.content.map(
                (_, idx) => {
                  return (
                    <Typography
                      key={idx}
                      sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
                    >
                      {t(
                        `toolBar.help.children.guide.children.shotcut.children.text.content.${idx}`
                      )}
                    </Typography>
                  );
                }
              )}
            </AccordionDetails>
          </Accordion>
        </>
      );
    }, []);

  const guideDialogAction: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <TooltipButton
          onClick={guideHandler.close}
          title={t("toolBar.help.common.button.close")}
        >
          {t("toolBar.help.common.button.close")}
        </TooltipButton>
      );
    }, [t]);

  const aboutDialogTitle: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {t("toolBar.help.children.about.title")}

          <TooltipButton
            title={t("toolBar.help.common.button.close")}
            onClick={aboutHandler.close}
            icon={<CloseTwoTone fontSize="small" />}
            color={"error"}
          />
        </Box>
      );
    }, [t]);

  const aboutDialogContent: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <>
          {/* Introdution */}
          <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
              <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                {t("toolBar.help.children.about.children.introdution.title")}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: 12 }}>
                {t("toolBar.help.children.about.children.introdution.content")}
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Version */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
              <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                {t("toolBar.help.children.about.children.version.title")}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: 12 }}>
                {t("toolBar.help.children.about.children.version.content")}
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Feature */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
              <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                {t("toolBar.help.children.about.children.feature.title")}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Typography sx={{ fontSize: 12 }}>
                {t(
                  "toolBar.help.children.about.children.feature.children.object.title"
                )}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {`${t(
                  "toolBar.help.children.about.children.feature.children.object.children.basic.title"
                )}: ${t("toolBar.help.children.about.children.feature.children.object.children.basic.content")}`}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {`${t(
                  "toolBar.help.children.about.children.feature.children.object.children.text.title"
                )}: ${t("toolBar.help.children.about.children.feature.children.object.children.text.content")}`}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {`${t(
                  "toolBar.help.children.about.children.feature.children.object.children.image.title"
                )}: ${t("toolBar.help.children.about.children.feature.children.object.children.image.content")}`}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {`${t(
                  "toolBar.help.children.about.children.feature.children.object.children.icon.title"
                )}: ${t("toolBar.help.children.about.children.feature.children.object.children.icon.content")}`}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {`${t(
                  "toolBar.help.children.about.children.feature.children.object.children.video.title"
                )}: ${t("toolBar.help.children.about.children.feature.children.object.children.video.content")}`}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {`${t(
                  "toolBar.help.children.about.children.feature.children.object.children.freeDrawing.title"
                )}: ${t("toolBar.help.children.about.children.feature.children.object.children.freeDrawing.content")}`}
              </Typography>

              <Typography sx={{ fontSize: 12 }}>
                {t(
                  "toolBar.help.children.about.children.feature.children.manipulation.title"
                )}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {`${t(
                  "toolBar.help.children.about.children.feature.children.manipulation.children.add.title"
                )}: ${t("toolBar.help.children.about.children.feature.children.manipulation.children.add.content")}`}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {`${t(
                  "toolBar.help.children.about.children.feature.children.manipulation.children.edit.title"
                )}: ${t("toolBar.help.children.about.children.feature.children.manipulation.children.edit.content")}`}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {`${t(
                  "toolBar.help.children.about.children.feature.children.manipulation.children.group.title"
                )}: ${t("toolBar.help.children.about.children.feature.children.manipulation.children.group.content")}`}
              </Typography>

              <Typography sx={{ fontSize: 12 }}>
                {t(
                  "toolBar.help.children.about.children.feature.children.template.title"
                )}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {t(
                  "toolBar.help.children.about.children.feature.children.template.content"
                )}
              </Typography>

              <Typography sx={{ fontSize: 12 }}>
                {t(
                  "toolBar.help.children.about.children.feature.children.io.title"
                )}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {t(
                  "toolBar.help.children.about.children.feature.children.io.content"
                )}
              </Typography>

              <Typography sx={{ fontSize: 12 }}>
                {t(
                  "toolBar.help.children.about.children.feature.children.shotcut.title"
                )}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {t(
                  "toolBar.help.children.about.children.feature.children.shotcut.content"
                )}
              </Typography>

              <Typography sx={{ fontSize: 12 }}>
                {t(
                  "toolBar.help.children.about.children.feature.children.history.title"
                )}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {t(
                  "toolBar.help.children.about.children.feature.children.history.content"
                )}
              </Typography>

              <Typography sx={{ fontSize: 12 }}>
                {t(
                  "toolBar.help.children.about.children.feature.children.other.title"
                )}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {t(
                  "toolBar.help.children.about.children.feature.children.other.content"
                )}
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Coming Soon Feature */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
              <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                {t(
                  "toolBar.help.children.about.children.comingSoonFeature.title"
                )}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Typography sx={{ fontSize: 12 }}>
                {t(
                  "toolBar.help.children.about.children.comingSoonFeature.children.improve.title"
                )}
              </Typography>

              <Typography
                sx={{ marginLeft: "1rem", fontSize: 12, fontWeight: 350 }}
              >
                {`${t(
                  "toolBar.help.children.about.children.comingSoonFeature.children.improve.title"
                )}: ${t("toolBar.help.children.about.children.comingSoonFeature.children.improve.content")}`}
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* License */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
              <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
                {t("toolBar.help.children.about.children.license.title")}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: 12 }}>
                {t("toolBar.help.children.about.children.license.content")}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </>
      );
    }, [t]);

  const aboutDialogAction: React.JSX.Element =
    React.useMemo((): React.JSX.Element => {
      return (
        <TooltipButton
          onClick={aboutHandler.close}
          title={t("toolBar.help.common.button.close")}
        >
          {t("toolBar.help.common.button.close")}
        </TooltipButton>
      );
    }, [t]);

  return (
    <>
      {/* Guide (Guide/Information) */}
      <PopperButton icon={<HelpTwoTone />} title={t("toolBar.help.title")}>
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
                <TipsAndUpdatesTwoTone
                  fontSize={"small"}
                  sx={{
                    marginRight: "0.25rem",
                  }}
                />
                {t("toolBar.help.children.guide.title")}
              </>
            }
            title={t("toolBar.help.children.guide.title")}
            onClick={guideHandler.open}
            sx={{
              justifyContent: "flex-start",
            }}
          />

          <TooltipButton
            icon={
              <>
                <InfoTwoTone
                  fontSize={"small"}
                  sx={{
                    marginRight: "0.25rem",
                  }}
                />
                {t("toolBar.help.children.about.title")}
              </>
            }
            title={t("toolBar.help.children.about.title")}
            onClick={aboutHandler.open}
            sx={{
              justifyContent: "flex-start",
            }}
          />
        </Paper>
      </PopperButton>

      {/* Guide Dialog */}
      <BasicDialog
        maxWidth={"sm"}
        open={isGuideOpen}
        onClose={guideHandler.onClose}
        dialogTitle={guideDialogTitle}
        dialogContent={guideDialogContent}
        dialogAction={guideDialogAction}
      />

      {/* About Dialog */}
      <BasicDialog
        maxWidth={"sm"}
        open={isAboutOpen}
        onClose={aboutHandler.onClose}
        dialogTitle={aboutDialogTitle}
        dialogContent={aboutDialogContent}
        dialogAction={aboutDialogAction}
      />
    </>
  );
});
