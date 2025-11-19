import { debounce } from "lodash";
import React from "react";

export function useDebounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number,
  deps: any[] = []
): [(...args: Parameters<T>) => void, () => void] {
  const funcRef = React.useRef<T>(func);

  React.useEffect(() => {
    funcRef.current = func;
  }, [func, ...deps]);

  const debounced = React.useMemo(() => {
    return debounce((...args: Parameters<T>) => {
      funcRef.current(...args);
    }, delay);
  }, [delay]);

  React.useEffect(() => {
    return () => {
      debounced.cancel();
    };
  }, [debounced]);

  return [debounced, debounced.cancel];
}
