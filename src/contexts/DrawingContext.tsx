import { DrawingMode } from "../types/FreeDrawing";
import { IDrawingContext } from "./Interfaces";
import { DrawingProviderProp } from "./Types";
import React from "react";

export const DrawingContext = React.createContext<IDrawingContext>({});

export function FreeDrawingProvider(
  prop: DrawingProviderProp
): React.JSX.Element {
  // Store drawing mode
  const [drawingMode, setDrawingMode] = React.useState<DrawingMode>(undefined);

  const contextValue: IDrawingContext = React.useMemo<IDrawingContext>(
    () => ({
      drawingMode,
      setDrawingMode,
    }),
    [drawingMode]
  );

  return (
    <DrawingContext.Provider value={contextValue}>
      {prop.children}
    </DrawingContext.Provider>
  );
}

export function useDrawingContext(): IDrawingContext {
  return React.useContext(DrawingContext);
}
