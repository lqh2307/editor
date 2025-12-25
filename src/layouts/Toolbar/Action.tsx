import { useShapesContext, useStageContext } from "../../contexts";
import { useDebounceHotKey } from "../../hooks/useDebounceHotKey";
import { FaObjectGroup, FaObjectUngroup } from "react-icons/fa";
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
    groupShapes,
    copyShape,
    pasteShape,
  } = useShapesContext();

  const isDisabled: boolean = React.useMemo<boolean>(() => {
    return selectedIds && !Object.keys(selectedIds).length;
  }, [selectedIds]);

  const isGroupDisabled: boolean = React.useMemo<boolean>(() => {
    return selectedIds && Object.keys(selectedIds).length < 2;
  }, [selectedIds]);

  const groupShapesHandler = React.useCallback(
    (value?: string): void => {
      const group: boolean = !!value;

      groupShapes(undefined, group);

      updateSnackbarAlert(
        group
          ? t("toolBar.unGroup.common.snackBarAlert.unGroup")
          : t("toolBar.group.common.snackBarAlert.group"),
        "success"
      );
    },
    [t, groupShapes, updateSnackbarAlert]
  );

  const selectAllHandler = React.useCallback((): void => {
    updateSelectedIds(undefined, false);
  }, [updateSelectedIds]);

  const copyShapeHandler = React.useCallback(
    (value?: string): void => {
      const cut: boolean = !!value;

      copyShape(undefined, cut);

      updateSnackbarAlert(
        cut
          ? t("toolBar.cut.common.snackBarAlert.cut")
          : t("toolBar.copy.common.snackBarAlert.copy"),
        "success"
      );
    },
    [t, copyShape, updateSnackbarAlert]
  );

  const pasteShapeHandler = React.useCallback((): void => {
    pasteShape();

    updateSnackbarAlert(
      t("toolBar.paste.common.snackBarAlert.paste"),
      "success"
    );
  }, [t, pasteShape, updateSnackbarAlert]);

  const pasteShapeToPositionHandler = React.useCallback((): void => {
    pasteShape(getStagePointerPosition());

    updateSnackbarAlert(
      t("toolBar.paste.common.snackBarAlert.paste"),
      "success"
    );
  }, [t, pasteShape, getStagePointerPosition, updateSnackbarAlert]);

  const duplicateShapeHandler = React.useCallback((): void => {
    duplicateShape(undefined);

    updateSnackbarAlert(
      t("toolBar.duplicate.common.snackBarAlert.duplicate"),
      "success"
    );
  }, [t, duplicateShape, updateSnackbarAlert]);

  const duplicateShapeToPositionHandler = React.useCallback((): void => {
    duplicateShape(undefined, getStagePointerPosition());

    updateSnackbarAlert(
      t("toolBar.duplicate.common.snackBarAlert.duplicate"),
      "success"
    );
  }, [t, duplicateShape, getStagePointerPosition, updateSnackbarAlert]);

  const deleteShapeHandler = React.useCallback((): void => {
    deleteShapes(undefined);

    updateSnackbarAlert(
      t("toolBar.delete.common.snackBarAlert.delete"),
      "success"
    );
  }, [t, deleteShapes, updateSnackbarAlert]);

  useDebounceHotKey({
    keys: ["ctrl+g", "meta+g"],
    callback: () => {
      groupShapesHandler();
    },
    deps: [groupShapesHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+shift+g", "meta+shift+g"],
    callback: () => {
      groupShapesHandler("true");
    },
    deps: [groupShapesHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+a", "meta+a"],
    callback: () => {
      selectAllHandler();
    },
    deps: [selectAllHandler],
  });

  useDebounceHotKey({
    keys: ["del", "delete"],
    callback: () => {
      deleteShapeHandler();
    },
    deps: [deleteShapeHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+x", "meta+x"],
    callback: () => {
      copyShapeHandler("true");
    },
    deps: [copyShapeHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+c", "meta+c"],
    callback: () => {
      copyShapeHandler();
    },
    deps: [copyShapeHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+v", "meta+v"],
    callback: () => {
      pasteShapeToPositionHandler();
    },
    deps: [pasteShapeToPositionHandler],
  });

  useDebounceHotKey({
    keys: ["ctrl+d", "meta+d"],
    callback: () => {
      duplicateShapeToPositionHandler();
    },
    deps: [duplicateShapeToPositionHandler],
  });

  {
    /* Group/Ungroup/Select All/Delete/Cut/Duplicate/Copy/Paste */
  }
  return (
    <ButtonGroup variant={"contained"} size={"small"}>
      <TooltipButton
        icon={<FaObjectGroup />}
        title={t("toolBar.group.title")}
        disabled={isGroupDisabled}
        onClick={groupShapesHandler}
      />

      <TooltipButton
        icon={<FaObjectUngroup />}
        title={t("toolBar.unGroup.title")}
        disabled={isGroupDisabled}
        value={"true"}
        onClick={groupShapesHandler}
      />

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
