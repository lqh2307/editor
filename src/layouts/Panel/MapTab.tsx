import React from "react";
import { TabPanel } from "@mui/lab";
import {
  Stack,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
  Box,
  Tooltip,
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
      <Stack sx={{ gap: "0.5rem", width: "100%" }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Lịch sử vị trí
        </Typography>
        <Stack sx={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "flex-start" }}>
          <Stack sx={{ flex: 1, gap: "0.5rem" }}>
            <Stack sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {/* keep CoordinateInput as-is but limit wrapper width so it flows within 250px */}
              <Box sx={{ width: "100%" }}>
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
              </Box>
              <Box sx={{ width: "100%" }}>
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
              </Box>

              {/* Compact action buttons: icon-only to save horizontal space */}
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Tooltip title="Thêm điểm" arrow>
                  <span>
                    <IconButton color="primary" size="small" onClick={addHistory} disabled={disabled} sx={{ p: 0.5 }}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Xóa tất cả" arrow>
                  <span>
                    <IconButton size="small" onClick={clearHistory} disabled={disabled} sx={{ p: 0.5 }}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                {/* optional small label to indicate functions when needed */}
                <Typography variant="caption" sx={{ color: "text.secondary", ml: 0.5 }}>
                  { (selectedShape?.locationHistory ?? []).length } điểm
                </Typography>
              </Stack>
            </Stack>

            {/* Compact Table inside fixed 250px Paper */}
            <Paper
              elevation={1}
              sx={{
                mt: 0.5,
                borderRadius: 1,
                overflow: "hidden",
                width: { xs: "100%", sm: "250px" },
                maxWidth: "250px",
              }}
            >
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <Table size="small" sx={{ minWidth: 220, tableLayout: "fixed", fontSize: '0.8rem' }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
                      <TableCell sx={{ width: 15, p: 0.5 }}>#</TableCell>
                      <TableCell sx={{ width: 55, p: 0.5 }}>Vĩ độ</TableCell>
                      <TableCell sx={{ width: 55, p: 0.5 }}>Kinh độ</TableCell>
                      <TableCell align="center" sx={{ width: 55, p: 0.5 }}>—</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedShape?.locationHistory ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 2, fontStyle: "italic", color: "text.secondary" }}>
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    ) : (
                      (selectedShape?.locationHistory ?? []).map((h, idx) => (
                        <TableRow
                          key={idx}
                          hover
                          sx={{ '&:hover': { backgroundColor: (theme) => theme.palette.action.selected } }}
                        >
                          <TableCell sx={{ width: 15, p: 0.5 }}>{idx + 1}</TableCell>
                          <TableCell sx={{ width: 55, p: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                            <Typography variant="caption">{h.lat.toFixed(6)}</Typography>
                          </TableCell>
                          <TableCell sx={{ width: 55, p: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                            <Typography variant="caption">{h.lon.toFixed(6)}</Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ width: 55, p: 0.5 }}>
                            <Stack direction="row" spacing={0} justifyContent="flex-end">
                              <Tooltip title="Lên" arrow>
                                <span>
                                  <IconButton aria-label="move-up" size="small" onClick={() => moveHistory(idx, "up")} disabled={disabled} sx={{ p: 0.4 }}>
                                    <ArrowUpward fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Xuống" arrow>
                                <span>
                                  <IconButton aria-label="move-down" size="small" onClick={() => moveHistory(idx, "down")} disabled={disabled} sx={{ p: 0.4 }}>
                                    <ArrowDownward fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Xóa" arrow>
                                <span>
                                  <IconButton aria-label="delete" size="small" onClick={() => removeHistory(idx)} disabled={disabled} sx={{ p: 0.4, color: (theme) => theme.palette.error.main }}>
                                    <DeleteOutline fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </Stack>
        </Stack>
      </Stack>
    </TabPanel>
  );
});
