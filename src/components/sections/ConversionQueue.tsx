"use client";

import type { FontFile } from "@/types";

interface Props {
  files: FontFile[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onConvertAll: () => void;
  onRetry: (id: string) => void;
  hasQueued: boolean;
  allDone: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

function getExt(name: string): string {
  return name.split(".").pop()?.toUpperCase() || "FONT";
}

export default function ConversionQueue({
  files,
  onRemove,
  onClear,
  onConvertAll,
  onRetry,
  hasQueued,
  allDone,
}: Props) {
  const downloadAll = () => {
    files
      .filter((f) => f.status === "done" && f.downloadUrl)
      .forEach((f) => {
        const a = document.createElement("a");
        a.href = f.downloadUrl!;
        a.download = f.outputName!;
        a.click();
      });
  };

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
      {/* Queue header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <span className="font-syne font-semibold text-white text-sm">
            {files.length} font{files.length !== 1 ? "s" : ""}
          </span>
          <StatusBadge files={files} />
        </div>
        <div className="flex items-center gap-2">
          {allDone && (
            <button
              onClick={downloadAll}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#00e676] text-[#0a0a0a] font-semibold hover:bg-[#00c853] transition-colors"
            >
              Download all
            </button>
          )}
          {hasQueued && (
            <button
              onClick={onConvertAll}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#00e676] text-[#0a0a0a] font-semibold hover:bg-[#00c853] transition-colors"
            >
              Convert all
            </button>
          )}
          <button
            onClick={onClear}
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-[#1e1e1e] text-[#666] hover:text-white hover:border-[#666] transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* File list */}
      <div className="divide-y divide-[#1e1e1e] max-h-[420px] overflow-y-auto">
        {files.map((f) => (
          <FileRow key={f.id} file={f} onRemove={onRemove} onRetry={onRetry} />
        ))}
      </div>
    </div>
  );
}

function FileRow({
  file,
  onRemove,
  onRetry,
}: {
  file: FontFile;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
      {/* Ext badge */}
      <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] border border-[#1e1e1e] flex flex-col items-center justify-center flex-shrink-0">
        <span className="font-mono text-[9px] text-[#666] font-bold leading-none">
          {getExt(file.name)}
        </span>
        <span className="font-mono text-[8px] text-[#00e676] leading-none mt-0.5">→W2</span>
      </div>

      {/* Name + size */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm text-white truncate">{file.name}</p>
        <p className="text-xs text-[#666] mt-0.5">{formatSize(file.size)}</p>
        {file.status === "error" && (
          <p className="text-xs text-red-400 mt-0.5">{file.error}</p>
        )}
      </div>

      {/* Status / actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {file.status === "queued" && (
          <span className="text-[10px] font-mono text-[#666] border border-[#1e1e1e] px-2 py-1 rounded-md">
            queued
          </span>
        )}

        {file.status === "converting" && (
          <div className="flex items-center gap-1.5 text-[#00e676]">
            <Spinner />
            <span className="text-xs font-mono">converting</span>
          </div>
        )}

        {file.status === "done" && file.downloadUrl && (
          <a
            href={file.downloadUrl}
            download={file.outputName}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20 hover:bg-[#00e676]/20 transition-colors"
          >
            <DownloadIcon />
            {file.outputName}
          </a>
        )}

        {file.status === "error" && (
          <button
            onClick={() => onRetry(file.id)}
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Retry
          </button>
        )}

        <button
          onClick={() => onRemove(file.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#666] hover:text-white hover:bg-[#1e1e1e] transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ files }: { files: FontFile[] }) {
  const done = files.filter((f) => f.status === "done").length;
  const errors = files.filter((f) => f.status === "error").length;
  const converting = files.filter((f) => f.status === "converting").length;

  if (converting > 0)
    return (
      <span className="text-[10px] font-mono text-[#00e676] bg-[#00e676]/10 border border-[#00e676]/20 px-2 py-0.5 rounded-full">
        converting…
      </span>
    );
  if (done === files.length)
    return (
      <span className="text-[10px] font-mono text-[#00e676] bg-[#00e676]/10 border border-[#00e676]/20 px-2 py-0.5 rounded-full">
        all done ✓
      </span>
    );
  if (errors > 0)
    return (
      <span className="text-[10px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
        {errors} error{errors !== 1 ? "s" : ""}
      </span>
    );
  return null;
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
