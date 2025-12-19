import React from "react";

export type GeoPoint = { lat: number; lon: number };

type MapCalibrationState = {
  topRight?: GeoPoint;
  bottomLeft?: GeoPoint;
  topLeft?: GeoPoint;
  bottomRight?: GeoPoint;
};

type MapContextValue = {
  calibration: MapCalibrationState;
  setTopRight: (p?: GeoPoint) => void;
  setBottomLeft: (p?: GeoPoint) => void;
  setTopLeft: (p?: GeoPoint) => void;
  setBottomRight: (p?: GeoPoint) => void;
};

const defaultValue: MapContextValue = {
  calibration: {},
  setTopRight: () => void 0,
  setBottomLeft: () => void 0,
  setTopLeft: () => void 0,
  setBottomRight: () => void 0,
};

export const MapContext = React.createContext<MapContextValue>(defaultValue);

export function MapProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [calibration, setCalibration] = React.useState<MapCalibrationState>({});

  const setTopRight = React.useCallback((p?: GeoPoint): void => {
    setCalibration((c) => ({ ...c, topRight: p }));
  }, []);

  const setBottomLeft = React.useCallback((p?: GeoPoint): void => {
    setCalibration((c) => ({ ...c, bottomLeft: p }));
  }, []);

  const setTopLeft = React.useCallback((p?: GeoPoint): void => {
    setCalibration((c) => ({ ...c, topLeft: p }));
  }, []);

  const setBottomRight = React.useCallback((p?: GeoPoint): void => {
    setCalibration((c) => ({ ...c, bottomRight: p }));
  }, []);

  const value = React.useMemo<MapContextValue>(
    () => ({
      calibration,
      setTopRight,
      setBottomLeft,
      setTopLeft,
      setBottomRight,
    }),
    [calibration, setTopRight, setBottomLeft, setTopLeft, setBottomRight]
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMapContext(): MapContextValue {
  return React.useContext(MapContext);
}
