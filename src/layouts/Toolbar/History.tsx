import { useShapesContext, useStageContext } from "../../contexts";
import { useDebounceHotKey } from "../../hooks/useDebounceHotKey";
import { TooltipButton } from "../../components/TooltipButton";
import { UndoTwoTone, RedoTwoTone } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { ButtonGroup } from "@mui/material";
import React from "react";

export const ToolbarHistory = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { updateSnackbarAlert } = useStageContext();

  const { canUndo, canRedo, doShapes } = useShapesContext();

  const doShapesHandler = React.useCallback(
    (value: string): void => {
      const redo: boolean = !!value;

      doShapes(redo);

      updateSnackbarAlert(
        redo
          ? t("toolBar.redo.common.snackBarAlert.redo")
          : t("toolBar.undo.common.snackBarAlert.undo"),
        "success"
      );
    },
    [doShapes, updateSnackbarAlert, t]
  );

  useDebounceHotKey({
    keys: ["ctrl+z", "cmd+z"],
    callback: (e) => {
      e.preventDefault();

      doShapesHandler("");
    },
    deps: [doShapesHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+y", "cmd+y"],
    callback: (e) => {
      e.preventDefault();

      doShapesHandler("true");
    },
    deps: [doShapesHandler],
  });

  return (
    <ButtonGroup variant={"contained"} size={"small"}>
      {/* Undo */}
      <TooltipButton
        icon={<UndoTwoTone />}
        title={t("toolBar.undo.title")}
        disabled={!canUndo}
        value={""}
        onClick={doShapesHandler}
      />

      {/* Redo */}
      <TooltipButton
        icon={<RedoTwoTone />}
        title={t("toolBar.redo.title")}
        disabled={!canRedo}
        value={"true"}
        onClick={doShapesHandler}
      />
    </ButtonGroup>
  );
});
