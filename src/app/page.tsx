"use client";

import { useState, useCallback } from "react";
import Header from "@/components/sections/Header";
import DropZone from "@/components/sections/DropZone";
import ConversionQueue from "@/components/sections/ConversionQueue";
import Footer from "@/components/sections/Footer";
import type { FontFile } from "@/types";

export default function HomePage() {
  const [files, setFiles] = useState<FontFile[]>([]);

  const addFiles = useCallback((newFiles: File[]) => {
    const items: FontFile[] = newFiles.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      name: f.name,
      size: f.size,
      status: "queued",
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const clearAll = () => setFiles([]);

  const convertAll = async () => {
    const queued = files.filter((f) => f.status === "queued");
    if (!queued.length) return;
    setFiles((prev) =>
      prev.map((f) => (f.status === "queued" ? { ...f, status: "converting" } : f))
    );
    for (const item of queued) await convertFile(item);
  };

  const convertFile = async (item: FontFile) => {
    const fd = new FormData();
    fd.append("font", item.file);
    try {
      const res = await fetch("/api/convert", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json();
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "error", error: err.error || "Conversion failed" } : f
          )
        );
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const outputName = item.name.replace(/\.[^/.]+$/, "") + ".woff2";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: "done", downloadUrl: url, outputName } : f
        )
      );
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: "error", error: "Network error" } : f
        )
      );
    }
  };

  const retryFile = async (id: string) => {
    const item = files.find((f) => f.id === id);
    if (!item) return;
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: "converting", error: undefined } : f)));
    await convertFile({ ...item, status: "converting" });
  };

  const hasQueued = files.some((f) => f.status === "queued");
  const allDone = files.length > 0 && files.every((f) => f.status === "done");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", position: "relative" }}>
      {/* Grid background */}
      <div className="grid-bg" style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none"
      }} />

      {/* Glow orb */}
      <div style={{
        position: "fixed",
        top: "-120px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "600px",
        height: "400px",
        background: "radial-gradient(ellipse, rgba(0,230,118,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
        <Header />

        <main style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "64px 16px 80px",
          gap: "48px",
        }}>
          {/* Hero */}
          <div style={{ textAlign: "center", maxWidth: "580px" }}>
            <div className="animate-fade-up" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "100px",
              padding: "6px 14px",
              marginBottom: "28px",
            }}>
              <span className="pulse-dot" />
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
                color: "var(--accent)",
                letterSpacing: "0.05em",
              }}>
                TTF · OTF · EOT · WOFF → WOFF2
              </span>
            </div>

            <h1 className="animate-fade-up-1" style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "clamp(48px, 8vw, 76px)",
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "var(--text)",
              marginBottom: "20px",
            }}>
              Convert fonts{" "}
              <span style={{ fontStyle: "italic", color: "var(--accent)" }}>perfectly</span>
              <br />to WOFF2
            </h1>

            <p className="animate-fade-up-2" style={{
              fontSize: "16px",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              maxWidth: "420px",
              margin: "0 auto",
            }}>
              Drop any font file. Get a web-optimized WOFF2 back in seconds —
              no signup, no limits, no storage.
            </p>
          </div>

          {/* Converter */}
          <div className="animate-fade-up-3" style={{ width: "100%", maxWidth: "680px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <DropZone onFiles={addFiles} />
            {files.length > 0 && (
              <ConversionQueue
                files={files}
                onRemove={removeFile}
                onClear={clearAll}
                onConvertAll={convertAll}
                onRetry={retryFile}
                hasQueued={hasQueued}
                allDone={allDone}
              />
            )}
          </div>

          {/* Features */}
          <FeatureGrid />
        </main>

        <Footer />
      </div>
    </div>
  );
}

function FeatureGrid() {
  const features = [
    {
      icon: <BoltIcon />,
      title: "Instant conversion",
      desc: "Server-side fonttools processing. No client-side JS magic.",
    },
    {
      icon: <LockIcon />,
      title: "Private by default",
      desc: "Files are processed and discarded immediately. Nothing stored.",
    },
    {
      icon: <LayersIcon />,
      title: "Batch support",
      desc: "Drop multiple fonts at once and convert them all in one click.",
    },
    {
      icon: <GlobeIcon />,
      title: "All formats",
      desc: "TTF, OTF, EOT, WOFF — all convert to the modern WOFF2 standard.",
    },
  ];

  return (
    <div className="animate-fade-up-4" style={{
      width: "100%",
      maxWidth: "680px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: "1px",
      background: "var(--border)",
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid var(--border)",
    }}>
      {features.map((f, i) => (
        <div key={i} style={{
          background: "var(--surface)",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          transition: "background 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--surface)")}
        >
          <div style={{ color: "var(--accent)", width: "18px", height: "18px" }}>{f.icon}</div>
          <p style={{ fontFamily: "DM Sans", fontWeight: 600, fontSize: "13px", color: "var(--text)" }}>{f.title}</p>
          <p style={{ fontSize: "12px", lineHeight: 1.6, color: "var(--text-secondary)" }}>{f.desc}</p>
        </div>
      ))}
    </div>
  );
}

function BoltIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function LockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function LayersIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
}
function GlobeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}
