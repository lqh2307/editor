import { TooltipCheckbox } from "../../components/TooltipCheckbox";
import { TooltipButton } from "../../components/TooltipButton";
import { TooltipSwitch } from "../../components/TooltipSwitch";
import { percentMarks, speedMarks } from "../../types/Common";
import { Mark } from "@mui/material/Slider/useSlider.types";
import { SliderInput } from "../../components/SliderInput";
import { useShapesContext } from "../../contexts";
import { useTranslation } from "react-i18next";
import { isSafari } from "../../utils/Utils";
import { TabPanel } from "@mui/lab";
import React from "react";
import {
  ExpandMoreTwoTone,
  PlayArrowTwoTone,
  Forward10TwoTone,
  Replay10TwoTone,
  VolumeUpTwoTone,
  SpeedTwoTone,
  PauseTwoTone,
} from "@mui/icons-material";
import {
  AccordionDetails,
  AccordionSummary,
  ButtonGroup,
  Typography,
  Accordion,
  Stack,
} from "@mui/material";

export const PanelControlTab = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { selectedShape, updateShape } = useShapesContext();

  const video: HTMLVideoElement = selectedShape.image as HTMLVideoElement;

  const [progress, setProgress] = React.useState<number>(0);
  const [progressValue, setProgressValue] = React.useState<Mark[]>(undefined);

  const updateShapeHandler = React.useMemo(
    () => ({
      changePlay: (value: string): void => {
        updateShape(
          {
            isPlay: !!value,
          },
          true,
          true
        );
      },
      changeLoop: (checked: boolean): void => {
        updateShape(
          {
            loop: checked,
          },
          true,
          true
        );
      },
      changeInvert: (checked: boolean): void => {
        updateShape(
          {
            inverse: checked,
          },
          true,
          true
        );
      },
      changeSpeed: (value: number): void => {
        updateShape(
          {
            speed: value,
          },
          true,
          true
        );
      },
      changeVolume: (value: number): void => {
        updateShape(
          {
            volume: value / 100,
          },
          true,
          true
        );
      },
      changeMove: (checked: boolean): void => {
        updateShape(
          {
            draggable: checked,
          },
          true,
          true
        );
      },
    }),
    [updateShape]
  );

  const updateVideoHandler = React.useMemo(
    () => ({
      forward: (value: string): void => {
        if (video) {
          const sign: number = value && video.playbackRate >= 0 ? 1 : -1;

          video.currentTime = video.currentTime + 10 * sign;
        }
      },
      seek: (value: number): void => {
        if (video) {
          video.currentTime = value;
        }
      },
    }),
    [video]
  );

  React.useEffect(() => {
    if (!video) {
      return;
    }

    setProgressValue([
      {
        value: 0,
        label: 0,
      },
      {
        value: video.duration,
        label: Math.ceil(video.duration),
      },
    ]);

    function updateProgress(): void {
      setProgress(video.currentTime);
    }

    video.addEventListener("timeupdate", updateProgress);

    return () => {
      if (!video) {
        return;
      }

      video.removeEventListener("timeupdate", updateProgress);
    };
  }, [video]);

  const isNotSafariRef = React.useRef<boolean>(!isSafari());

  return (
    <TabPanel sx={{ width: "100%", paddingX: 0 }} value={"control"}>
      {/* General */}
      <Accordion
        sx={{
          display: selectedShape.type === "video" ? "block" : "none",
        }}
        defaultExpanded={true}
      >
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.control.children.general.title")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          {/* Progress */}
          <SliderInput
            value={progress}
            max={progressValue?.[1].value}
            marks={progressValue}
            onChange={updateVideoHandler.seek}
          />

          {/* Relay/Play/Pause/Forward */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ButtonGroup variant={"outlined"} size={"small"}>
              <TooltipButton
                icon={<Replay10TwoTone fontSize={"small"} />}
                title={t("panel.control.children.general.children.relay.title")}
                onClick={updateVideoHandler.forward}
              />

              {selectedShape.isPlay ? (
                <TooltipButton
                  icon={<PauseTwoTone fontSize={"small"} />}
                  title={t(
                    "panel.control.children.general.children.pause.title"
                  )}
                  onClick={updateShapeHandler.changePlay}
                />
              ) : (
                <TooltipButton
                  icon={<PlayArrowTwoTone fontSize={"small"} />}
                  title={t(
                    "panel.control.children.general.children.play.title"
                  )}
                  value={"true"}
                  onClick={updateShapeHandler.changePlay}
                />
              )}

              <TooltipButton
                icon={<Forward10TwoTone fontSize={"small"} />}
                title={t(
                  "panel.control.children.general.children.forward.title"
                )}
                value={"true"}
                onClick={updateVideoHandler.forward}
              />
            </ButtonGroup>
          </Stack>

          {/* Loop/Invert */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <TooltipCheckbox
              label={
                <Typography fontSize={12}>
                  {t("panel.control.children.general.children.loop.title")}
                </Typography>
              }
              title={t("panel.control.children.general.children.loop.title")}
              checked={selectedShape.loop}
              onChange={updateShapeHandler.changeLoop}
            />

            <TooltipCheckbox
              label={
                <Typography fontSize={12}>
                  {t("panel.control.children.general.children.inverse.title")}
                </Typography>
              }
              title={t("panel.control.children.general.children.inverse.title")}
              checked={selectedShape.inverse}
              onChange={updateShapeHandler.changeInvert}
              disabled={isNotSafariRef.current}
            />
          </Stack>

          {/* Speed */}
          <SliderInput
            icon={<SpeedTwoTone fontSize={"small"} />}
            title={t("panel.control.children.general.children.speed.title")}
            value={selectedShape.speed}
            min={0}
            max={2}
            step={0.01}
            marks={speedMarks}
            onChange={updateShapeHandler.changeSpeed}
          />

          {/* Volume */}
          <SliderInput
            icon={<VolumeUpTwoTone fontSize={"small"} />}
            title={t("panel.control.children.general.children.volume.title")}
            value={selectedShape.volume * 100}
            max={100}
            marks={percentMarks}
            onChange={updateShapeHandler.changeVolume}
          />
        </AccordionDetails>
      </Accordion>

      {/* Move */}
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreTwoTone />}>
          <Typography sx={{ fontSize: 12, textTransform: "uppercase" }}>
            {t("panel.control.children.move.title")}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Enabled */}
          <TooltipSwitch
            label={
              <Typography fontSize={12}>
                {t("panel.control.children.move.children.enabled.title")}
              </Typography>
            }
            title={t("panel.control.children.move.children.enabled.title")}
            checked={selectedShape.draggable}
            onChange={updateShapeHandler.changeMove}
          />
        </AccordionDetails>
      </Accordion>
    </TabPanel>
  );
});
