import { TbBorderCornerRounded, TbArrowWaveRightUp } from "react-icons/tb";
import { useShapesContext, useStageContext } from "../../contexts";
import { TooltipButton } from "../../components/TooltipButton";
import { PopperButton } from "../../components/PopperButton";
import { FiCornerRightDown } from "react-icons/fi";
import { KonvaDragDrop } from "../../types/Konva";
import { useTranslation } from "react-i18next";
import { PiWaveSine } from "react-icons/pi";
import { Paper, Box } from "@mui/material";
import React from "react";
import {
  SignalWifiStatusbarNullTwoTone,
  HorizontalRuleTwoTone,
  ArrowRightAltTwoTone,
  TripOriginTwoTone,
  RectangleTwoTone,
  PentagonTwoTone,
  CategoryTwoTone,
  CircleTwoTone,
  StarTwoTone,
} from "@mui/icons-material";

export const ToolbarAddRegularShape = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { getStageCenter } = useStageContext();

  const { addShapes } = useShapesContext();

  const addRegularShapeHandler = React.useCallback(
    async (value: string): Promise<void> => {
      const data: KonvaDragDrop = JSON.parse(value) as KonvaDragDrop;

      await addShapes(
        [
          {
            type: data.type,
          },
        ],
        false,
        false,
        getStageCenter()
      );
    },
    [addShapes, getStageCenter]
  );

  const dragRegularShapeHandler = React.useCallback(
    (e: React.DragEvent<HTMLButtonElement>): void => {
      e.dataTransfer?.setData("data", e.currentTarget?.value);
    },
    []
  );

  {
    /* Add Shapes (Line/Arrow/Circle/Ellipse/Rectangle/Convex Polygon/Concave Polygon/Ring/Wedge) */
  }
  return (
    <PopperButton
      icon={<CategoryTwoTone />}
      title={t("toolBar.addShape.title")}
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <TooltipButton
            icon={<HorizontalRuleTwoTone fontSize={"small"} />}
            title={t("toolBar.addShape.children.line.title")}
            onClick={addRegularShapeHandler}
            value={JSON.stringify({
              type: "line",
            })}
            onDragStart={dragRegularShapeHandler}
            draggable={true}
            sx={{
              minWidth: 36,
              minHeight: 32,
            }}
          />

          <TooltipButton
            icon={<ArrowRightAltTwoTone fontSize={"small"} />}
            title={t("toolBar.addShape.children.arrow.title")}
            onClick={addRegularShapeHandler}
            value={JSON.stringify({
              type: "arrow",
            })}
            onDragStart={dragRegularShapeHandler}
            draggable={true}
            sx={{
              minWidth: 36,
              minHeight: 32,
            }}
          />

          <TooltipButton
            icon={<CircleTwoTone fontSize={"small"} />}
            title={t("toolBar.addShape.children.circle.title")}
            onClick={addRegularShapeHandler}
            value={JSON.stringify({
              type: "circle",
            })}
            onDragStart={dragRegularShapeHandler}
            draggable={true}
            sx={{
              minWidth: 36,
              minHeight: 32,
            }}
          />

          <TooltipButton
            icon={
              <CircleTwoTone
                fontSize={"small"}
                sx={{ transform: "scaleY(0.6)" }}
              />
            }
            title={t("toolBar.addShape.children.ellipse.title")}
            onClick={addRegularShapeHandler}
            value={JSON.stringify({
              type: "ellipse",
            })}
            onDragStart={dragRegularShapeHandler}
            draggable={true}
            sx={{
              minWidth: 36,
              minHeight: 32,
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <TooltipButton
            icon={<RectangleTwoTone fontSize={"small"} />}
            title={t("toolBar.addShape.children.rectangle.title")}
            onClick={addRegularShapeHandler}
            value={JSON.stringify({
              type: "rectangle",
            })}
            onDragStart={dragRegularShapeHandler}
            draggable={true}
            sx={{
              minWidth: 36,
              minHeight: 32,
            }}
          />

          <TooltipButton
            icon={<PentagonTwoTone fontSize={"small"} />}
            title={t("toolBar.addShape.children.convexPolygon.title")}
            onClick={addRegularShapeHandler}
            value={JSON.stringify({
              type: "convex-polygon",
            })}
            onDragStart={dragRegularShapeHandler}
            draggable={true}
            sx={{
              minWidth: 36,
              minHeight: 32,
            }}
          />

          <TooltipButton
            icon={<StarTwoTone fontSize={"small"} />}
            title={t("toolBar.addShape.children.concavePolygon.title")}
            onClick={addRegularShapeHandler}
            value={JSON.stringify({
              type: "concave-polygon",
            })}
            onDragStart={dragRegularShapeHandler}
            draggable={true}
            sx={{
              minWidth: 36,
              minHeight: 32,
            }}
          />

          <TooltipButton
            icon={<TripOriginTwoTone fontSize={"small"} />}
            title={t("toolBar.addShape.children.ring.title")}
            onClick={addRegularShapeHandler}
            value={JSON.stringify({
              type: "ring",
            })}
            onDragStart={dragRegularShapeHandler}
            draggable={true}
            sx={{
              minWidth: 36,
              minHeight: 32,
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <TooltipButton
            icon={
              <TbBorderCornerRounded
                fontSize={"20px"}
                style={{ rotate: "90deg" }}
              />
            }
            title={t("toolBar.addShape.children.quadraticCurve.title")}
            onClick={addRegularShapeHandler}
            value={JSON.stringify({
              type: "quadratic-curve",
            })}
            onDragStart={dragRegularShapeHandler}
            draggable={true}
            sx={{
              minWidth: 36,
              minHeight: 32,
            }}
          />

          <TooltipButton
            icon={<FiCornerRightDown fontSize={"20px"} />}
            title={t("toolBar.addShape.children.quadraticArrowCurve.title")}
            onClick={addRegularShapeHandler}
            value={JSON.stringify({
              type: "quadratic-arrow-curve",
            })}
            onDragStart={dragRegularShapeHandler}
            draggable={true}
            sx={{
              minWidth: 36,
              minHeight: 32,
            }}
          />

          <TooltipButton
            icon={<PiWaveSine fontSize={"20px"} />}
            title={t("toolBar.addShape.children.bezierCurve.title")}
            onClick={addRegularShapeHandler}
            value={JSON.stringify({
              type: "bezier-curve",
            })}
            onDragStart={dragRegularShapeHandler}
            draggable={true}
            sx={{
              minWidth: 36,
              minHeight: 32,
            }}
          />

          <TooltipButton
            icon={<TbArrowWaveRightUp fontSize={"20px"} />}
            title={t("toolBar.addShape.children.bezierArrowCurve.title")}
            onClick={addRegularShapeHandler}
            value={JSON.stringify({
              type: "bezier-arrow-curve",
            })}
            onDragStart={dragRegularShapeHandler}
            draggable={true}
            sx={{
              minWidth: 36,
              minHeight: 32,
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <TooltipButton
            icon={<SignalWifiStatusbarNullTwoTone fontSize={"small"} />}
            title={t("toolBar.addShape.children.wedge.title")}
            onClick={addRegularShapeHandler}
            value={JSON.stringify({
              type: "wedge",
            })}
            onDragStart={dragRegularShapeHandler}
            draggable={true}
            sx={{
              minWidth: 36,
              minHeight: 32,
            }}
          />
        </Box>
      </Paper>
    </PopperButton>
  );
});
