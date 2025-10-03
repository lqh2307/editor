import { useShapesContext, useStageContext } from "../../contexts";
import { TooltipButton } from "../../components/TooltipButton";
import { TextFieldsTwoTone } from "@mui/icons-material";
import { KonvaDragDrop } from "../../types/Konva";
import { useTranslation } from "react-i18next";
import React from "react";

export const ToolbarAddText = React.memo((): React.JSX.Element => {
  const { t } = useTranslation();

  const { getStageCenter } = useStageContext();

  const { addShapes } = useShapesContext();

  const addTextHandler = React.useCallback(
    async (value: string): Promise<void> => {
      const data: KonvaDragDrop = JSON.parse(value) as KonvaDragDrop;

      await addShapes(
        [
          {
            type: data.type,
          },
        ],
        false,
        undefined,
        getStageCenter()
      );
    },
    [addShapes, getStageCenter]
  );

  const dragTextHandler = React.useCallback(
    (e: React.DragEvent<HTMLButtonElement>): void => {
      e.dataTransfer?.setData("data", e.currentTarget?.value);
    },
    []
  );

  {
    /* Add Text */
  }
  return (
    <TooltipButton
      icon={<TextFieldsTwoTone />}
      title={t("toolBar.addText.title")}
      onClick={addTextHandler}
      value={JSON.stringify({
        type: "text",
      })}
      onDragStart={dragTextHandler}
      draggable={true}
    />
  );
});
