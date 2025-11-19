import { useHotkeys } from "react-hotkeys-hook";
import { UseDebounceHotKeyProp } from "./Types";
import { useDebounce } from "./useDebounce";

export function useDebounceHotKey({
  keys,
  callback,
  delay = 200,
  options,
  deps = [],
}: UseDebounceHotKeyProp) {
  const [debounced] = useDebounce(callback, delay, deps);

  useHotkeys(
    keys,
    (event, handler) => {
      event.preventDefault();
      debounced(event, handler);
    },
    options,
    deps
  );
}
