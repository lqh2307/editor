import React, { useRef, useState } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Draggable from "react-draggable";
import { createPortal } from "react-dom";

export interface DraggableTab {
  key: string;
  label: string;
}

export interface DraggableTabsPanelProps<T = any> {
  tabs: DraggableTab[];
  data: T;
  renderTab: (key: string, data: T) => React.ReactNode;
  title?: string;
  defaultPosition?: {
    x: number;
    y: number;
  };
  width?: number;
  height?: number;
  onClose?: () => void;
}

const DraggableTabsPanel = <T,>({
  tabs,
  data,
  renderTab,
  title = "Panel",
  defaultPosition = { x: 100, y: 100 },
  width,
  height,
  onClose,
}: DraggableTabsPanelProps<T>) => {
  const [activeTab, setActiveTab] = useState<string | undefined>(
    tabs?.[0]?.key
  );

  const nodeRef = useRef<HTMLDivElement | null>(null);

  const panel = (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      bounds="body"
      defaultPosition={defaultPosition}
    >
      <div
        ref={nodeRef}
        style={{
          width: width ?? 540,
          height: height ?? 420,
          position: "fixed",
          top: 0,
          left: 0,
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 99999,
          pointerEvents: "auto",
        }}
      >
        {/* HEADER */}
        <div
          className="drag-handle"
          style={{
            padding: "8px 12px",
            cursor: "move",
            background: "#f5f5f5",
            borderBottom: "1px solid #ddd",
            fontWeight: 600,
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1 }}>{title}</div>
          {onClose && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="close"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </div>

        {/* TABS - horizontally scrollable when many groups */}
        <div
          style={{
            display: "block",
            borderBottom: "1px solid #eee",
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {tabs.map((tab) => (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "inline-block",
                padding: "6px 10px",
                cursor: "pointer",
                borderBottom:
                  activeTab === tab.key
                    ? "2px solid #1677ff"
                    : "2px solid transparent",
                marginRight: 6,
                userSelect: "none",
                fontSize: 13,
                minWidth: 80,
                textAlign: "center",
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, padding: 12, overflow: "auto" }}>
          {activeTab && renderTab(activeTab, data)}
        </div>
      </div>
    </Draggable>
  );

  return createPortal(panel, document.body);
};

export default DraggableTabsPanel;
