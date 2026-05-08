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

const btn = {
  primary: {
    base: {
      fontFamily: "'DM Mono', monospace",
      fontSize: "12px",
      fontWeight: 500,
      padding: "6px 14px",
      borderRadius: "8px",
      background: "var(--accent)",
      color: "#080808",
      border: "none",
      cursor: "pointer",
      letterSpacing: "0.01em",
      transition: "opacity 0.15s",
    } as React.CSSProperties,
  },
  ghost: {
    base: {
      fontFamily: "'DM Mono', monospace",
      fontSize: "12px",
      fontWeight: 400,
      padding: "6px 14px",
      borderRadius: "8px",
      background: "transparent",
      color: "var(--text-secondary)",
      border: "1px solid var(--border)",
      cursor: "pointer",
      transition: "color 0.15s, border-color 0.15s",
    } as React.CSSProperties,
  },
};

export default function ConversionQueue({ files, onRemove, onClear, onConvertAll, onRetry, hasQueued, allDone }: Props) {
  const downloadAll = () => {
    files.filter((f) => f.status === "done" && f.downloadUrl).forEach((f) => {
      const a = document.createElement("a");
      a.href = f.downloadUrl!;
      a.download = f.outputName!;
      a.click();
    });
  };

  const done = files.filter(f => f.status === "done").length;
  const errors = files.filter(f => f.status === "error").length;
  const converting = files.filter(f => f.status === "converting").length;

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "14px",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 18px",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "DM Sans", fontWeight: 500, fontSize: "13px", color: "var(--text)" }}>
            {files.length} {files.length === 1 ? "font" : "fonts"}
          </span>
          {converting > 0 && <StatusPill label="converting…" color="accent" />}
          {!converting && allDone && <StatusPill label="all done" color="accent" icon={<CheckIcon />} />}
          {!converting && errors > 0 && <StatusPill label={`${errors} error${errors > 1 ? "s" : ""}`} color="red" />}
          {!converting && !allDone && done > 0 && <StatusPill label={`${done} / ${files.length}`} color="dim" />}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {allDone && (
            <button onClick={downloadAll} style={btn.primary.base}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              Download all
            </button>
          )}
          {hasQueued && (
            <button onClick={onConvertAll} style={btn.primary.base}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              Convert all
            </button>
          )}
          <button onClick={onClear} style={btn.ghost.base}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--text-secondary)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}>
            Clear
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: "380px", overflowY: "auto" }}>
        {files.map((f, i) => (
          <FileRow
            key={f.id}
            file={f}
            onRemove={onRemove}
            onRetry={onRetry}
            isLast={i === files.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function FileRow({ file, onRemove, onRetry, isLast }: {
  file: FontFile;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  isLast: boolean;
}) {
  const ext = getExt(file.name);
  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 18px",
      borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
      transition: "background 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.01)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {/* Ext badge */}
      <div style={{
        flexShrink: 0,
        width: "44px",
        height: "44px",
        borderRadius: "10px",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1px",
      }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "8px", color: "var(--text-secondary)", fontWeight: 500, letterSpacing: "0.05em" }}>
          {ext}
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "7px", color: "var(--accent)", letterSpacing: "0.05em" }}>
          →W2
        </span>
      </div>

      {/* Name + size */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "13px",
          color: "var(--text)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {nameWithoutExt}
          <span style={{ color: "var(--text-secondary)" }}>.{ext.toLowerCase()}</span>
        </p>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
          {formatSize(file.size)}
          {file.status === "error" && (
            <span style={{ color: "var(--red)", marginLeft: "6px" }}>{file.error}</span>
          )}
        </p>
      </div>

      {/* Status */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px" }}>
        {file.status === "queued" && (
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px",
            color: "var(--text-muted)",
            border: "1px solid var(--border)",
            padding: "3px 8px",
            borderRadius: "6px",
            letterSpacing: "0.03em",
          }}>
            queued
          </span>
        )}

        {file.status === "converting" && (
          <span style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px",
            color: "var(--accent)",
          }}>
            <span className="animate-spin-icon" style={{ display: "block" }}><SpinnerIcon /></span>
            converting
          </span>
        )}

        {file.status === "done" && file.downloadUrl && (
          <a
            href={file.downloadUrl}
            download={file.outputName}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              color: "var(--accent)",
              background: "var(--accent-dim)",
              border: "1px solid var(--accent-border)",
              padding: "5px 10px",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "background 0.15s",
              whiteSpace: "nowrap",
              maxWidth: "160px",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,230,118,0.12)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--accent-dim)")}
          >
            <DownloadIcon />
            {file.outputName}
          </a>
        )}

        {file.status === "error" && (
          <button
            onClick={() => onRetry(file.id)}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px",
              color: "var(--red)",
              background: "rgba(255,68,68,0.06)",
              border: "1px solid rgba(255,68,68,0.2)",
              padding: "5px 10px",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,68,68,0.12)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,68,68,0.06)")}
          >
            Retry
          </button>
        )}

        <button
          onClick={() => onRemove(file.id)}
          style={{
            width: "26px",
            height: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            transition: "color 0.15s, background 0.15s",
            fontSize: "16px",
            lineHeight: 1,
          }}
          onMouseEnter={e => { (e.currentTarget.style.color = "var(--text)"); (e.currentTarget.style.background = "var(--surface-2)"); }}
          onMouseLeave={e => { (e.currentTarget.style.color = "var(--text-muted)"); (e.currentTarget.style.background = "transparent"); }}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

function StatusPill({ label, color, icon }: { label: string; color: "accent" | "red" | "dim"; icon?: React.ReactNode }) {
  const colors = {
    accent: { color: "var(--accent)", bg: "var(--accent-dim)", border: "var(--accent-border)" },
    red:    { color: "var(--red)",    bg: "rgba(255,68,68,0.06)", border: "rgba(255,68,68,0.2)" },
    dim:    { color: "var(--text-secondary)", bg: "transparent", border: "var(--border)" },
  };
  const c = colors[color];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      fontFamily: "'DM Mono', monospace",
      fontSize: "10px",
      letterSpacing: "0.03em",
      color: c.color,
      background: c.bg,
      border: `1px solid ${c.border}`,
      padding: "2px 8px",
      borderRadius: "100px",
    }}>
      {icon}
      {label}
    </span>
  );
}

function SpinnerIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
}
function DownloadIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function CheckIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function CloseIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
