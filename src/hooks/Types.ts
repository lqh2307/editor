import {
  Options,
  Hotkey,
} from "react-hotkeys-hook/packages/react-hotkeys-hook/dist/types";

export type UseDebounceHotKeyProp = {
  keys: string | string[];
  callback: (event: KeyboardEvent, handler: Hotkey) => void;
  delay?: number;
  options?: Options;
  deps: any;
};

export type UseFetchAPIProp = {
  url: string;
  options: any;
};
