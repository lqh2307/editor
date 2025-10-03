import { WindowSize } from "../types/Window";
import React from "react";

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = React.useState<WindowSize>({
    width: innerWidth,
    height: innerHeight,
  });

  React.useEffect(() => {
    function handleWindowResize(): void {
      setWindowSize({
        width: innerWidth,
        height: innerHeight,
      });
    }

    addEventListener("resize", handleWindowResize);

    return () => {
      removeEventListener("resize", handleWindowResize);
    };
  }, []);

  return windowSize;
}
