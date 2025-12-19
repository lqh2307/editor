import { CoordinateInput } from "../CoordinateInput";
import { Box, Stack, Typography } from "@mui/material";
import { useMapContext } from "../../contexts";
import React from "react";

export const MapOriginPanel = React.memo((): React.JSX.Element => {
  const { calibration, setTopRight, setBottomLeft } = useMapContext();

  const [trLat, setTrLat] = React.useState<number>(
    calibration.topRight?.lat ?? 0
  );
  const [trLon, setTrLon] = React.useState<number>(
    calibration.topRight?.lon ?? 0
  );
  const [blLat, setBlLat] = React.useState<number>(
    calibration.bottomLeft?.lat ?? 0
  );
  const [blLon, setBlLon] = React.useState<number>(
    calibration.bottomLeft?.lon ?? 0
  );

  React.useEffect(() => {
    setTrLat(calibration.topRight?.lat ?? 0);
    setTrLon(calibration.topRight?.lon ?? 0);
    setBlLat(calibration.bottomLeft?.lat ?? 0);
    setBlLon(calibration.bottomLeft?.lon ?? 0);
  }, [calibration.topRight, calibration.bottomLeft]);

  const updateTopRight = React.useCallback(() => {
    setTopRight({ lat: trLat, lon: trLon });
  }, [trLat, trLon, setTopRight]);

  const updateBottomLeft = React.useCallback(() => {
    setBottomLeft({ lat: blLat, lon: blLon });
  }, [blLat, blLon, setBottomLeft]);

  React.useEffect(() => {
    updateTopRight();
  }, [trLat, trLon, updateTopRight]);

  React.useEffect(() => {
    updateBottomLeft();
  }, [blLat, blLon, updateBottomLeft]);

  return (
    <Stack sx={{ gap: "0.75rem", width: "100%" }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Top-Right</Typography>
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <CoordinateInput
          title={"Latitude"}
          isLat={true}
          decimalLabel={"Lat (°)"}
          value={trLat}
          onChange={(v) => setTrLat(v)}
          delay={150}
        />
        <CoordinateInput
          title={"Longitude"}
          isLat={false}
          decimalLabel={"Lon (°)"}
          value={trLon}
          onChange={(v) => setTrLon(v)}
          delay={150}
        />
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 700, marginTop: "0.5rem" }}>
        Bottom-Left
      </Typography>
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <CoordinateInput
          title={"Latitude"}
          isLat={true}
          decimalLabel={"Lat (°)"}
          value={blLat}
          onChange={(v) => setBlLat(v)}
          delay={150}
        />
        <CoordinateInput
          title={"Longitude"}
          isLat={false}
          decimalLabel={"Lon (°)"}
          value={blLon}
          onChange={(v) => setBlLon(v)}
          delay={150}
        />
      </Box>
      {/* Only two points needed: Top-Right and Bottom-Left */}
      <Typography sx={{ fontSize: 12, color: "#666" }}>
        Coordinates calibrate the image: TR = top-right, BL = bottom-left.
      </Typography>
      <Box sx={{ height: 8 }} />
      <Box>
        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Apply</Typography>
        <Box sx={{ fontSize: 12, color: "#888" }}>
          Changes are auto-saved when you edit values.
        </Box>
      </Box>
    </Stack>
  );
});
