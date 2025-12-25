import React from "react";
import { TabPanel } from "@mui/lab";
import {
  Stack,
  Typography,
  Divider,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import {
  DeleteOutline,
  ArrowUpward,
  ArrowDownward,
  Add as AddIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { CoordinateInput } from "../../components/CoordinateInput";
import { useShapesContext } from "../../contexts";

export const MapOriginPanel = React.memo((): React.JSX.Element => {
  const { selectedShape, updateShape } = useShapesContext();

  const disabled = !selectedShape?.id;

  const currentGL = React.useMemo(() => {
    const gl = selectedShape?.geographicalLocation;
    return (
      gl ?? {
        topRight: { lat: 0, lon: 0 },
        bottomLeft: { lat: 0, lon: 0 },
      }
    );
  }, [selectedShape]);

  const updateGeo = React.useCallback(
    (partial: {
      topRight?: { lat?: number; lon?: number };
      bottomLeft?: { lat?: number; lon?: number };
    }) => {
      const base = selectedShape?.geographicalLocation ?? {
        topRight: { lat: 0, lon: 0 },
        bottomLeft: { lat: 0, lon: 0 },
      };

      const next = {
        topRight: {
          lat: partial.topRight?.lat ?? base.topRight.lat,
          lon: partial.topRight?.lon ?? base.topRight.lon,
        },
        bottomLeft: {
          lat: partial.bottomLeft?.lat ?? base.bottomLeft.lat,
          lon: partial.bottomLeft?.lon ?? base.bottomLeft.lon,
        },
      };

      updateShape?.({ id: selectedShape?.id, geographicalLocation: next }, true, true);
    },
    [selectedShape, updateShape]
  );

  const [histLat, setHistLat] = React.useState<number>(0);
  const [histLon, setHistLon] = React.useState<number>(0);

  React.useEffect(() => {
    const last = (selectedShape?.locationHistory ?? []).slice(-1)[0];
    if (last) {
      setHistLat(last.lat);
      setHistLon(last.lon);
    }
  }, [selectedShape?.locationHistory]);

  const addHistory = React.useCallback(() => {
    if (!selectedShape?.id) return;
    const prev = selectedShape.locationHistory ?? [];
    const next = prev.concat({ lat: histLat, lon: histLon });
    updateShape?.({ id: selectedShape.id, locationHistory: next }, true, true);
  }, [selectedShape, histLat, histLon, updateShape]);

  const clearHistory = React.useCallback(() => {
    if (!selectedShape?.id) return;
    updateShape?.({ id: selectedShape.id, locationHistory: [] }, true, true);
  }, [selectedShape, updateShape]);

  const removeHistory = React.useCallback(
    (index: number) => {
      if (!selectedShape?.id) return;
      const prev = selectedShape.locationHistory ?? [];
      const next = prev.filter((_, i) => i !== index);
      updateShape?.({ id: selectedShape.id, locationHistory: next }, true, true);
    },
    [selectedShape, updateShape]
  );

  const moveHistory = React.useCallback(
    (index: number, dir: "up" | "down") => {
      if (!selectedShape?.id) return;
      const prev = selectedShape.locationHistory ?? [];
      if (!prev.length) return;
      const target = dir === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return;
      const next = prev.slice(0);
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      updateShape?.({ id: selectedShape.id, locationHistory: next }, true, true);
    },
    [selectedShape, updateShape]
  );

  return (
    <TabPanel value="map" sx={{ width: "100%", paddingX: 0 }}>
      <Stack sx={{ gap: "1rem", width: "100%" }}>
        <Typography variant="subtitle2">Lịch sử vị trí (Location History)</Typography>
        <Stack sx={{ display: "flex", flexDirection: "row", gap: "0.75rem", alignItems: "flex-start" }}>
          <Stack sx={{ flex: 1, gap: "0.75rem" }}>
            <Stack sx={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <CoordinateInput
                isLat={true}
                value={histLat}
                decimalLabel="Vĩ độ"
                degreeLabel="Độ"
                minuteLabel="Phút"
                secondLabel="Giây"
                toggleModeTitle="Đổi giữa độ thập phân và DMS"
                onChange={(val) => setHistLat(val)}
              />
              <CoordinateInput
                isLat={false}
                value={histLon}
                decimalLabel="Kinh độ"
                degreeLabel="Độ"
                minuteLabel="Phút"
                secondLabel="Giây"
                toggleModeTitle="Đổi giữa độ thập phân và DMS"
                onChange={(val) => setHistLon(val)}
              />
              <IconButton aria-label="add" color="primary" onClick={addHistory} disabled={disabled}>
                <AddIcon />
              </IconButton>
        
            </Stack>

            <Table size="small" sx={{ width: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 54 }}>#</TableCell>
                  <TableCell>Vĩ độ</TableCell>
                  <TableCell>Kinh độ</TableCell>
                  <TableCell align="right" sx={{ width: 140 }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(selectedShape?.locationHistory ?? []).map((h, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{h.lat.toFixed(6)}</TableCell>
                    <TableCell>{h.lon.toFixed(6)}</TableCell>
                    <TableCell align="right">
                      <IconButton aria-label="move-up" size="small" onClick={() => moveHistory(idx, "up")} disabled={disabled}>
                        <ArrowUpward fontSize="inherit" />
                      </IconButton>
                      <IconButton aria-label="move-down" size="small" onClick={() => moveHistory(idx, "down")} disabled={disabled}>
                        <ArrowDownward fontSize="inherit" />
                      </IconButton>
                      <IconButton aria-label="delete" size="small" onClick={() => removeHistory(idx)} disabled={disabled}>
                        <DeleteOutline fontSize="inherit" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
        </Stack>
      </Stack>
    </TabPanel>
  );
});
