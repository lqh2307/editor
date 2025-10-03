import { TooltipButton } from "../../components/TooltipButton";
import { LayerAction } from "../../components/KonvaShape";
import { useShapesContext } from "../../contexts";
import { useTranslation } from "react-i18next";
import { Align } from "../../types/Window";
import { TabPanel } from "@mui/lab";
import React from "react";
import {
  KeyboardArrowDownTwoTone,
  KeyboardArrowUpTwoTone,
  ExpandMoreTwoTone,
  NorthEastTwoTone,
  NorthWestTwoTone,
  SouthWestTwoTone,
  SouthEastTwoTone,
  AdjustTwoTone,
  NorthTwoTone,
  SouthTwoTone,
  FlipToFront,
  EastTwoTone,
  WestTwoTone,
  FlipTwoTone,
  FlipToBack,
} from "@mui/icons-material";
import {
  AccordionDetails,
  AccordionSummary,
  ButtonGroup,
  Typography,
  Accordion,
} from "@mui/material";

export const PanelArrangeTab = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { layerShape, alignShape, flipShape } = useShapesContext();

  const alignShapeHandler = React.useCallback(
    (value: string): void => {
      const { horizontal, vertical }: Align = JSON.parse(value) as Align;

      alignShape(undefined, horizontal, vertical);
    },
    [alignShape]
  );

  const layerShapeHandler = React.useCallback(
    (value: string): void => {
      layerShape(undefined, value as LayerAction);
    },
    [layerShape]
  );

  const flipHandler = React.useCallback(
    (value: string): void => {
      flipShape(undefined, !!value);
    },
    [flipShape]
  );

  return (
    <TabPanel sx={{ width: "100%", paddingX: 0 }} value={"arrange"}>
      {/* Layer */}
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.arrange.children.layer.title")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* To Front/To Back/Bring Forward/Send Backward */}
          <ButtonGroup variant={"outlined"} size={"small"}>
            <TooltipButton
              icon={<FlipToFront fontSize={"small"} />}
              title={t("panel.arrange.children.layer.children.toFront.title")}
              value={"front"}
              onClick={layerShapeHandler}
            />

            <TooltipButton
              icon={<FlipToBack fontSize={"small"} />}
              title={t("panel.arrange.children.layer.children.toBack.title")}
              value={"back"}
              onClick={layerShapeHandler}
            />

            <TooltipButton
              icon={<KeyboardArrowUpTwoTone fontSize={"small"} />}
              title={t(
                "panel.arrange.children.layer.children.bringForward.title"
              )}
              value={"forward"}
              onClick={layerShapeHandler}
            />

            <TooltipButton
              icon={<KeyboardArrowDownTwoTone fontSize={"small"} />}
              title={t(
                "panel.arrange.children.layer.children.sendBackward.title"
              )}
              value={"backward"}
              onClick={layerShapeHandler}
            />
          </ButtonGroup>
        </AccordionDetails>
      </Accordion>

      {/* Align */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.arrange.children.align.title")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Top Left/Top/Top Right */}
          <ButtonGroup variant={"outlined"} size={"small"}>
            <TooltipButton
              icon={<NorthWestTwoTone fontSize={"small"} />}
              title={t("panel.arrange.children.align.children.topLeft.title")}
              value={JSON.stringify({
                horizontal: "left",
                vertical: "top",
              })}
              onClick={alignShapeHandler}
            />

            <TooltipButton
              icon={<NorthTwoTone fontSize={"small"} />}
              title={t("panel.arrange.children.align.children.top.title")}
              value={JSON.stringify({
                horizontal: undefined,
                vertical: "top",
              })}
              onClick={alignShapeHandler}
            />

            <TooltipButton
              icon={<NorthEastTwoTone fontSize={"small"} />}
              title={t("panel.arrange.children.align.children.topRight.title")}
              value={JSON.stringify({
                horizontal: "right",
                vertical: "top",
              })}
              onClick={alignShapeHandler}
            />
          </ButtonGroup>

          {/* Left/Center/Right */}
          <ButtonGroup variant={"outlined"} size={"small"}>
            <TooltipButton
              icon={<WestTwoTone fontSize={"small"} />}
              title={t("panel.arrange.children.align.children.left.title")}
              value={JSON.stringify({
                horizontal: "left",
                vertical: undefined,
              })}
              onClick={alignShapeHandler}
            />

            <TooltipButton
              icon={<AdjustTwoTone fontSize={"small"} />}
              title={t("panel.arrange.children.align.children.center.title")}
              value={JSON.stringify({
                horizontal: "center",
                vertical: "middle",
              })}
              onClick={alignShapeHandler}
            />

            <TooltipButton
              icon={<EastTwoTone fontSize={"small"} />}
              title={t("panel.arrange.children.align.children.right.title")}
              value={JSON.stringify({
                horizontal: "right",
                vertical: undefined,
              })}
              onClick={alignShapeHandler}
            />
          </ButtonGroup>

          {/* Bottom Left/Bottom/Bottom Right */}
          <ButtonGroup variant={"outlined"} size={"small"}>
            <TooltipButton
              icon={<SouthWestTwoTone fontSize={"small"} />}
              title={t(
                "panel.arrange.children.align.children.bottomLeft.title"
              )}
              value={JSON.stringify({
                horizontal: "left",
                vertical: "bottom",
              })}
              onClick={alignShapeHandler}
            />

            <TooltipButton
              icon={<SouthTwoTone fontSize={"small"} />}
              title={t("panel.arrange.children.align.children.bottom.title")}
              value={JSON.stringify({
                horizontal: undefined,
                vertical: "bottom",
              })}
              onClick={alignShapeHandler}
            />

            <TooltipButton
              icon={<SouthEastTwoTone fontSize={"small"} />}
              title={t(
                "panel.arrange.children.align.children.bottomRight.title"
              )}
              value={JSON.stringify({
                horizontal: "right",
                vertical: "bottom",
              })}
              onClick={alignShapeHandler}
            />
          </ButtonGroup>
        </AccordionDetails>
      </Accordion>

      {/* Flip */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.arrange.children.flip.title")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Horizontal Flip/Vertical Flip */}
          <ButtonGroup variant={"outlined"} size={"small"}>
            <TooltipButton
              icon={<FlipTwoTone fontSize={"small"} />}
              title={t("panel.arrange.children.flip.children.horizontal.title")}
              value={""}
              onClick={flipHandler}
            />

            <TooltipButton
              icon={<FlipTwoTone fontSize={"small"} sx={{ rotate: "90deg" }} />}
              title={t("panel.arrange.children.flip.children.vertical.title")}
              value={"true"}
              onClick={flipHandler}
            />
          </ButtonGroup>
        </AccordionDetails>
      </Accordion>
    </TabPanel>
  );
});
