"use client";

import { useCallback, useState, useRef } from "react";

const ACCEPTED = [".ttf", ".otf", ".eot", ".woff", ".woff2"];

function isValidFont(file: File): boolean {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return ACCEPTED.includes(ext);
}

interface DropZoneProps {
  onFiles: (files: File[]) => void;
}

export default function DropZone({ onFiles }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (rawFiles: FileList | File[]) => {
      const valid = Array.from(rawFiles).filter(isValidFont);
      if (valid.length > 0) onFiles(valid);
    },
    [onFiles]
  );

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      style={{
        position: "relative",
        cursor: "pointer",
        borderRadius: "14px",
        border: `1.5px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
        background: dragging ? "var(--accent-dim)" : "var(--surface)",
        padding: "52px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px",
        transition: "all 0.2s ease",
        transform: dragging ? "scale(1.005)" : "scale(1)",
        userSelect: "none",
      }}
      onMouseEnter={e => {
        if (!dragging) {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,230,118,0.3)";
          (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
        }
      }}
      onMouseLeave={e => {
        if (!dragging) {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLElement).style.background = "var(--surface)";
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        style={{ display: "none" }}
        onChange={onInputChange}
      />

      {/* Icon */}
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background: dragging ? "var(--accent-dim)" : "var(--surface-2)",
        border: `1px solid ${dragging ? "var(--accent-border)" : "var(--border)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: dragging ? "var(--accent)" : "var(--text-secondary)",
        transition: "all 0.2s",
      }}>
        <UploadIcon />
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{
          fontFamily: "DM Sans",
          fontWeight: 500,
          fontSize: "15px",
          color: dragging ? "var(--accent)" : "var(--text)",
          marginBottom: "4px",
          transition: "color 0.2s",
        }}>
          {dragging ? "Release to add fonts" : "Drop font files here"}
        </p>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          or{" "}
          <span style={{ color: "var(--accent)", fontWeight: 500 }}>click to browse</span>
          {" "}— TTF, OTF, EOT, WOFF, WOFF2
        </p>
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}
