import { useTranslation } from "react-i18next";
import { IAppContext } from "./Interfaces";
import { AppProviderProp } from "./Types";
import React from "react";

export const AppContext = React.createContext<IAppContext>({});

export function AppProvider(prop: AppProviderProp): React.JSX.Element {
  const { i18n } = useTranslation();

  // Store guide lines threshold
  const [guideLinesThreshold, setGuideLinesThreshold] = React.useState<number>(
    prop.guideLinesThreshold
  );

  // Store auto guide lines stick
  const [guideLinesStick, setGuideLinesStick] = React.useState<boolean>(
    prop.guideLinesStick
  );

  // Store language
  const [language, setLanguage] = React.useState<string>(prop.language);

  const updateLanguage = React.useCallback((lang: string): void => {
    i18n.changeLanguage(lang, () => {
      setLanguage(lang);
    });
  }, []);

  // Store panel width
  const [panelWidth, setPanelWidth] = React.useState<number>(prop.panelWidth);

  // Store panel color
  const [panelColor, setPanelColor] = React.useState<string>(prop.panelColor);

  // Store canvas color
  const [canvasColor, setCanvasColor] = React.useState<string>(
    prop.canvasColor
  );

  // Store toolbar height
  const [toolbarHeight, setToolbarHeight] = React.useState<number>(
    prop.toolbarHeight
  );

  // Store toolbar color
  const [toolbarColor, setToolbarColor] = React.useState<string>(
    prop.toolbarColor
  );

  const contextValue = React.useMemo<IAppContext>(
    () => ({
      language,
      updateLanguage,

      guideLinesThreshold,
      setGuideLinesThreshold,

      guideLinesStick,
      setGuideLinesStick,

      panelWidth,
      setPanelWidth,
      panelColor,
      setPanelColor,

      canvasColor,
      setCanvasColor,

      toolbarHeight,
      setToolbarHeight,
      toolbarColor,
      setToolbarColor,
    }),
    [
      language,
      guideLinesThreshold,
      guideLinesStick,
      panelWidth,
      panelColor,
      canvasColor,
      toolbarHeight,
      toolbarColor,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {prop.children}
    </AppContext.Provider>
  );
}

export function useAppContext(): IAppContext {
  return React.useContext(AppContext);
}
