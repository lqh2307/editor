import { useDrawingContext, useShapesContext } from "../../contexts";
import { PanelArrangeTab } from "./ArrangeTab";
import { MapOriginPanel } from "../../components/MapOriginPanel/MapOriginPanel";
import { useTranslation } from "react-i18next";
import { TabContext, TabList } from "@mui/lab";
import { PanelControlTab } from "./ControlTab";
import { PanelStyleTab } from "./StyleTab";
import { PanelTextTab } from "./TextTab";
import { Box, Tab } from "@mui/material";
import { FilterTab } from "./FilterTab";
import React from "react";

export const PanelTabContent = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { drawingMode } = useDrawingContext();

  const { selectedShape, shapeList } = useShapesContext();

  const [tab, setTab] = React.useState<string>("style");

  let guideText: string;
  if (!shapeList.length) {
    guideText = t("guideText.emptyShapeList.title");
  } else if (!selectedShape.id) {
    guideText = t("guideText.noSelectedId.title");
  } else if (drawingMode) {
    guideText = t("guideText.drawing.title");
  }

  React.useEffect(() => {
    setTab(() => {
      if (selectedShape.type === "text") {
        return "text";
      } else if (selectedShape.type === "video") {
        return "control";
      } else if (selectedShape.type === "image") {
        return "map";
      } else {
        return "style";
      }
    });
  }, [selectedShape.type]);

  const changeTabHandler = React.useCallback(
    (_: React.SyntheticEvent<Element, Event>, value: string): void => {
      setTab(value);
    },
    []
  );

  return guideText ? (
    <Box
      sx={{
        color: "#ff0000",
        fontSize: 16,
        fontStyle: "italic",
        fontWeight: 700,
      }}
    >
      {guideText}
    </Box>
  ) : (
    <TabContext value={tab}>
      <TabList
        onChange={changeTabHandler}
        indicatorColor={"secondary"}
        textColor={"secondary"}
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
        }}
      >
        <Tab
          sx={{
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            minWidth: 0,
            flex: 1,
            paddingX: 0,
            wordSpacing: "10rem",
            wordBreak: "break-word",
            textAlign: "center",
          }}
          label={t("panel.control.title")}
          value={"control"}
        />

        <Tab
          sx={{
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            minWidth: 0,
            flex: 1,
            paddingX: 0,
            wordSpacing: "10rem",
            wordBreak: "break-word",
            textAlign: "center",
          }}
          label={t("panel.style.title")}
          value={"style"}
        />

        <Tab
          sx={{
            fontSize: 13,
            fontWeight: 700,
            display: selectedShape.type === "text" ? "flex" : "none",
            minWidth: 0,
            flex: 1,
            paddingX: 0,
            wordSpacing: "10rem",
            wordBreak: "break-word",
            textAlign: "center",
          }}
          label={t("panel.text.title")}
          value={"text"}
        />

        <Tab
          sx={{
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            minWidth: 0,
            flex: 1,
            paddingX: 0,
            wordSpacing: "10rem",
            wordBreak: "break-word",
            textAlign: "center",
          }}
          label={t("panel.arrange.title")}
          value={"arrange"}
        />

        <Tab
          sx={{
            fontSize: 13,
            fontWeight: 700,
            display: selectedShape.type === "image" ? "flex" : "none",
            minWidth: 0,
            flex: 1,
            paddingX: 0,
            wordSpacing: "10rem",
            wordBreak: "break-word",
            textAlign: "center",
          }}
          label={t("panel.filter.title")}
          value={"filter"}
        />

        <Tab
          sx={{
            fontSize: 13,
            fontWeight: 700,
            display: selectedShape.type === "image" ? "flex" : "none",
            minWidth: 0,
            flex: 1,
            paddingX: 0,
            wordSpacing: "10rem",
            wordBreak: "break-word",
            textAlign: "center",
          }}
          label={"Map"}
          value={"map"}
        />
      </TabList>

      <PanelControlTab />

      <PanelStyleTab />

      <PanelTextTab />

      <PanelArrangeTab />

      <FilterTab />

      {tab === "map" && <MapOriginPanel />}
    </TabContext>
  );
});
