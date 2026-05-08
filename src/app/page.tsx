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

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => setFiles([]);

  const convertAll = async () => {
    const queued = files.filter((f) => f.status === "queued");
    if (queued.length === 0) return;

    // Mark all queued as converting
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "queued" ? { ...f, status: "converting" } : f
      )
    );

    // Convert one by one
    for (const item of queued) {
      await convertFile(item);
    }
  };

  const convertFile = async (item: FontFile) => {
    const formData = new FormData();
    formData.append("font", item.file);

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: "error", error: err.error || "Conversion failed" }
              : f
          )
        );
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const outputName = item.name.replace(/\.[^/.]+$/, "") + ".woff2";

      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: "done", downloadUrl: url, outputName }
            : f
        )
      );
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: "error", error: "Network error" }
            : f
        )
      );
    }
  };

  const retryFile = async (id: string) => {
    const item = files.find((f) => f.id === id);
    if (!item) return;
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "converting", error: undefined } : f))
    );
    await convertFile({ ...item, status: "converting" });
  };

  const hasQueued = files.some((f) => f.status === "queued");
  const allDone = files.length > 0 && files.every((f) => f.status === "done");

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 py-12 gap-10">
        {/* Hero */}
        <div className="text-center max-w-2xl animate-[fadeUp_0.5s_ease_forwards]">
          <div className="inline-flex items-center gap-2 bg-[#111] border border-[#1e1e1e] rounded-full px-4 py-1.5 text-xs font-mono text-[#00e676] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
            TTF · OTF · EOT · WOFF → WOFF2
          </div>
          <h1 className="font-syne text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4">
            Convert fonts to{" "}
            <span className="text-[#00e676]">WOFF2</span>
          </h1>
          <p className="text-[#666] text-lg leading-relaxed">
            Drop any font file. Get a web-optimized WOFF2 instantly — no signup,
            no limits, no nonsense.
          </p>
        </div>

        {/* Converter */}
        <div className="w-full max-w-3xl flex flex-col gap-4">
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
  );
}

function FeatureGrid() {
  const features = [
    {
      icon: "⚡",
      title: "Instant conversion",
      desc: "Server-side fonttools processing. No client-side JS magic.",
    },
    {
      icon: "🔒",
      title: "Private by default",
      desc: "Files are processed and discarded immediately. Nothing stored.",
    },
    {
      icon: "📦",
      title: "Batch support",
      desc: "Drop multiple fonts at once and convert them all in one click.",
    },
    {
      icon: "🌐",
      title: "All formats",
      desc: "TTF, OTF, EOT, WOFF — all convert to the modern WOFF2 standard.",
    },
  ];

  return (
    <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
      {features.map((f) => (
        <div
          key={f.title}
          className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 flex flex-col gap-2 hover:border-[#00e676]/30 transition-colors"
        >
          <span className="text-2xl">{f.icon}</span>
          <p className="font-syne font-semibold text-sm text-white">{f.title}</p>
          <p className="text-[#666] text-xs leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}
