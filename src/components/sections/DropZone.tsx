"use client";

import { useCallback, useState, useRef } from "react";

const ACCEPTED = [".ttf", ".otf", ".eot", ".woff", ".woff2"];
const ACCEPTED_MIME = [
  "font/ttf",
  "font/otf",
  "font/eot",
  "font/woff",
  "font/woff2",
  "application/font-sfnt",
  "application/x-font-ttf",
  "application/x-font-opentype",
  "application/vnd.ms-fontobject",
  "application/octet-stream",
  "application/font-woff",
  "application/font-woff2",
];

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

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

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
      className={`
        relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-12
        flex flex-col items-center justify-center gap-4 select-none
        ${dragging
          ? "border-[#00e676] bg-[#00e676]/5 scale-[1.01]"
          : "border-[#1e1e1e] bg-[#111] hover:border-[#00e676]/40 hover:bg-[#111]"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        className="hidden"
        onChange={onInputChange}
      />

      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors
          ${dragging ? "bg-[#00e676]/20" : "bg-[#1a1a1a] group-hover:bg-[#00e676]/10"}`}
      >
        <FontIcon active={dragging} />
      </div>

      <div className="text-center">
        <p className="font-syne font-semibold text-white text-lg">
          {dragging ? "Drop your fonts here" : "Drop fonts or click to browse"}
        </p>
        <p className="text-[#666] text-sm mt-1">
          Supports TTF, OTF, EOT, WOFF, WOFF2
        </p>
      </div>

      {dragging && (
        <div className="absolute inset-0 rounded-2xl border-2 border-[#00e676] pointer-events-none animate-pulse" />
      )}
    </div>
  );
}

function FontIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "#00e676" : "#666"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
