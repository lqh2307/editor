import { FreeDrawingMode } from "../types/FreeDrawing";
import { IFreeDrawingContext } from "./Interfaces";
import { FreeDrawingProviderProp } from "./Types";
import React from "react";

export const FreeDrawingContext = React.createContext<IFreeDrawingContext>({});

export function FreeDrawingProvider(
  prop: FreeDrawingProviderProp
): React.JSX.Element {
  // Store free drawing mode
  const [freeDrawingMode, setFreeDrawingMode] =
    React.useState<FreeDrawingMode>(undefined);

  const contextValue = React.useMemo<IFreeDrawingContext>(
    () => ({
      freeDrawingMode,
      setFreeDrawingMode,
    }),
    [freeDrawingMode]
  );

  return (
    <FreeDrawingContext.Provider value={contextValue}>
      {prop.children}
    </FreeDrawingContext.Provider>
  );
}

export function useFreeDrawingContext(): IFreeDrawingContext {
  return React.useContext(FreeDrawingContext);
}
