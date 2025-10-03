import { useShapesContext, useStageContext } from "../../contexts";
import { useDebounceHotKey } from "../../hooks/useDebounceHotKey";
import { TooltipButton } from "../../components/TooltipButton";
import { useTranslation } from "react-i18next";
import { ButtonGroup } from "@mui/material";
import React from "react";
import {
  DeleteForeverTwoTone,
  ContentPasteTwoTone,
  ContentCopyTwoTone,
  ContentCopyRounded,
  ContentCutTwoTone,
  SelectAllTwoTone,
} from "@mui/icons-material";

export const ToolbarAction = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { getStagePointerPosition, updateSnackbarAlert } = useStageContext();

  const {
    selectedIds,
    copiedShapes,
    shapeList,
    duplicateShape,
    updateSelectedIds,
    deleteShapes,
    copyShape,
    pasteShape,
  } = useShapesContext();

  const isDisabled = React.useMemo<boolean>(() => {
    return selectedIds && !Object.keys(selectedIds).length;
  }, [selectedIds]);

  const selectAllHandler = React.useCallback((): void => {
    updateSelectedIds(undefined, false);
  }, [updateSelectedIds]);

  const copyShapeHandler = React.useCallback(
    (value: string): void => {
      const cut: boolean = !!value;

      copyShape(undefined, cut);

      updateSnackbarAlert(
        cut
          ? t("toolBar.cut.common.snackBarAlert.cut")
          : t("toolBar.copy.common.snackBarAlert.copy"),
        "success"
      );
    },
    [copyShape, updateSnackbarAlert, t]
  );

  const pasteShapeHandler = React.useCallback((): void => {
    pasteShape();

    updateSnackbarAlert(
      t("toolBar.paste.common.snackBarAlert.paste"),
      "success"
    );
  }, [pasteShape, updateSnackbarAlert, t]);

  const pasteShapeToPositionHandler = React.useCallback((): void => {
    pasteShape(getStagePointerPosition());

    updateSnackbarAlert(
      t("toolBar.paste.common.snackBarAlert.paste"),
      "success"
    );
  }, [pasteShape, getStagePointerPosition, updateSnackbarAlert, t]);

  const duplicateShapeHandler = React.useCallback((): void => {
    duplicateShape(undefined);

    updateSnackbarAlert(
      t("toolBar.duplicate.common.snackBarAlert.duplicate"),
      "success"
    );
  }, [duplicateShape, updateSnackbarAlert, t]);

  const duplicateShapeToPositionHandler = React.useCallback((): void => {
    duplicateShape(undefined, getStagePointerPosition());

    updateSnackbarAlert(
      t("toolBar.duplicate.common.snackBarAlert.duplicate"),
      "success"
    );
  }, [duplicateShape, getStagePointerPosition, updateSnackbarAlert, t]);

  const deleteShapeHandler = React.useCallback((): void => {
    deleteShapes(undefined);

    updateSnackbarAlert(
      t("toolBar.delete.common.snackBarAlert.delete"),
      "success"
    );
  }, [deleteShapes, updateSnackbarAlert, t]);

  useDebounceHotKey({
    keys: ["ctrl+a", "cmd+a"],
    callback: (e) => {
      e.preventDefault();

      selectAllHandler();
    },
    deps: [selectAllHandler],
  });

  useDebounceHotKey({
    keys: ["del", "delete"],
    callback: (e) => {
      e.preventDefault();

      deleteShapeHandler();
    },
    deps: [deleteShapeHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+x", "cmd+x"],
    callback: (e) => {
      e.preventDefault();

      copyShapeHandler("true");
    },
    deps: [copyShapeHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+c", "cmd+c"],
    callback: (e) => {
      e.preventDefault();

      copyShapeHandler("");
    },
    deps: [copyShapeHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+v", "cmd+v"],
    callback: (e) => {
      e.preventDefault();

      pasteShapeToPositionHandler();
    },
    deps: [pasteShapeToPositionHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+d", "cmd+d"],
    callback: (e) => {
      e.preventDefault();

      duplicateShapeToPositionHandler();
    },
    deps: [duplicateShapeToPositionHandler],
  });

  {
    /* Select All/Delete/Cut/Duplicate/Copy/Paste */
  }
  return (
    <ButtonGroup variant={"contained"} size={"small"}>
      <TooltipButton
        icon={<SelectAllTwoTone />}
        title={t("toolBar.selectAll.title")}
        disabled={!shapeList?.length}
        onClick={selectAllHandler}
      />

      <TooltipButton
        icon={<DeleteForeverTwoTone />}
        title={t("toolBar.delete.title")}
        disabled={isDisabled}
        onClick={deleteShapeHandler}
      />

      <TooltipButton
        icon={<ContentCutTwoTone />}
        title={t("toolBar.cut.title")}
        disabled={isDisabled}
        value={"true"}
        onClick={copyShapeHandler}
      />

      <TooltipButton
        icon={<ContentCopyRounded />}
        title={t("toolBar.duplicate.title")}
        disabled={isDisabled}
        onClick={duplicateShapeHandler}
      />

      <TooltipButton
        icon={<ContentCopyTwoTone />}
        title={t("toolBar.copy.title")}
        disabled={isDisabled}
        value={""}
        onClick={copyShapeHandler}
      />

      <TooltipButton
        icon={<ContentPasteTwoTone />}
        title={t("toolBar.paste.title")}
        disabled={!copiedShapes}
        onClick={pasteShapeHandler}
      />
    </ButtonGroup>
  );
});
