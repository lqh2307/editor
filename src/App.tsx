import { Box } from "@mui/material";
import { Editor } from "./layouts";
import React from "react";

export default function App(): React.JSX.Element {
  addEventListener("keydown", (e) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "s" ||
        e.key === "u" ||
        e.key === "w" ||
        e.key === "-" ||
        e.key === "+")
    ) {
      e.preventDefault();
    }
  });

  return (
    <Box className="App">
      <Editor />
    </Box>
  );
}
