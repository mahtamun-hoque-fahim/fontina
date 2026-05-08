import { NextRequest, NextResponse } from "next/server";
import path from "path";

// Pure WASM/JS conversion — no Python, works on Vercel serverless
// wawoff2: TTF/OTF bytes → WOFF2 bytes via WASM (Google's woff2 encoder)
// For EOT/WOFF input we need to extract raw sfnt bytes first

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED = [".ttf", ".otf", ".eot", ".woff", ".woff2"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("font") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!SUPPORTED.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported format: ${ext}` },
        { status: 400 }
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // If already WOFF2 — decompress to TTF then re-compress (normalize/optimize)
    // For WOFF — strip wrapper to get raw sfnt
    // For TTF/OTF — pass directly
    // For EOT — strip EOT header to get raw sfnt
    let sfntBuffer: Buffer;

    if (ext === ".woff2") {
      // Decompress WOFF2 → TTF first, then re-compress
      const { decompress, compress } = await import("wawoff2");
      const decompressed = await decompress(new Uint8Array(inputBuffer));
      const recompressed = await compress(decompressed);
      const outputName = file.name.replace(/\.[^/.]+$/, "") + ".woff2";
      return new NextResponse(Buffer.from(recompressed), {
        status: 200,
        headers: woff2Headers(outputName, recompressed.length),
      });
    }

    if (ext === ".woff") {
      sfntBuffer = extractSfntFromWoff(inputBuffer);
    } else if (ext === ".eot") {
      sfntBuffer = extractSfntFromEot(inputBuffer);
    } else {
      // TTF or OTF — use directly
      sfntBuffer = inputBuffer;
    }

    // Compress to WOFF2 via WASM
    const { compress } = await import("wawoff2");
    const woff2Bytes = await compress(new Uint8Array(sfntBuffer));

    const outputName = file.name.replace(/\.[^/.]+$/, "") + ".woff2";
    return new NextResponse(Buffer.from(woff2Bytes), {
      status: 200,
      headers: woff2Headers(outputName, woff2Bytes.length),
    });
  } catch (err: any) {
    console.error("[fontina] conversion error:", err);
    return NextResponse.json(
      { error: err?.message || "Conversion failed" },
      { status: 500 }
    );
  }
}

function woff2Headers(filename: string, length: number): Record<string, string> {
  return {
    "Content-Type": "font/woff2",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": String(length),
    "Cache-Control": "no-store",
  };
}

/**
 * Strip WOFF wrapper to get raw sfnt (TTF/OTF) bytes.
 * WOFF layout: 4-byte signature (0x774F4646), then sfnt flavor at offset 4,
 * then tables. We reconstruct a minimal TTF from WOFF table entries.
 *
 * For simplicity, we rely on wawoff2's decompress which accepts WOFF too —
 * but it only handles WOFF2. So we do manual WOFF → sfnt here.
 *
 * Practical approach: wawoff2 compress() accepts TTF/OTF (sfnt) bytes.
 * WOFF is just a container with compressed tables. We can reconstruct TTF
 * by reading WOFF table directory and copying uncompressed table data.
 */
function extractSfntFromWoff(woffBuf: Buffer): Buffer {
  // Validate signature: 'wOFF' = 0x774F4646
  const sig = woffBuf.readUInt32BE(0);
  if (sig !== 0x774F4646) {
    // Not a real WOFF, try passing raw
    return woffBuf;
  }

  const sfntFlavor = woffBuf.readUInt32BE(4);   // e.g. 0x00010000 = TrueType, 0x4F54544F = CFF
  const numTables  = woffBuf.readUInt16BE(12);

  // Build sfnt table directory
  // sfnt header: 12 bytes + 16 bytes per table entry
  const searchRange  = Math.pow(2, Math.floor(Math.log2(numTables))) * 16;
  const entrySelector = Math.floor(Math.log2(numTables));
  const rangeShift   = numTables * 16 - searchRange;

  // Collect table info from WOFF directory (starts at offset 44)
  type TableEntry = { tag: number; offset: number; compLen: number; origLen: number; origChecksum: number };
  const tables: TableEntry[] = [];
  for (let i = 0; i < numTables; i++) {
    const base = 44 + i * 20;
    tables.push({
      tag:          woffBuf.readUInt32BE(base),
      offset:       woffBuf.readUInt32BE(base + 4),
      compLen:      woffBuf.readUInt32BE(base + 8),
      origLen:      woffBuf.readUInt32BE(base + 12),
      origChecksum: woffBuf.readUInt32BE(base + 16),
    });
  }

  // Calculate total output size
  const headerSize = 12 + numTables * 16;
  const totalDataSize = tables.reduce((sum, t) => sum + ((t.origLen + 3) & ~3), 0);
  const totalSize = headerSize + totalDataSize;
  const out = Buffer.alloc(totalSize, 0);

  // Write sfnt header
  out.writeUInt32BE(sfntFlavor, 0);
  out.writeUInt16BE(numTables, 4);
  out.writeUInt16BE(searchRange, 6);
  out.writeUInt16BE(entrySelector, 8);
  out.writeUInt16BE(rangeShift, 10);

  // Write table entries and data
  let dataOffset = headerSize;
  for (let i = 0; i < numTables; i++) {
    const t = tables[i];

    // Read table data (WOFF tables can be zlib-compressed)
    let tableData: Buffer;
    const raw = woffBuf.slice(t.offset, t.offset + t.compLen);

    if (t.compLen < t.origLen) {
      // Compressed with zlib deflate
      try {
        const { inflateSync } = require("zlib");
        tableData = inflateSync(raw);
      } catch {
        tableData = raw;
      }
    } else {
      tableData = raw;
    }

    // Write table directory entry
    const dirOffset = 12 + i * 16;
    out.writeUInt32BE(t.tag, dirOffset);
    out.writeUInt32BE(t.origChecksum, dirOffset + 4);
    out.writeUInt32BE(dataOffset, dirOffset + 8);
    out.writeUInt32BE(t.origLen, dirOffset + 12);

    // Write table data
    tableData.copy(out, dataOffset);
    dataOffset += (t.origLen + 3) & ~3; // 4-byte align
  }

  return out;
}

/**
 * Strip EOT header to recover the embedded sfnt font data.
 * EOT starts with a variable-length header followed by the font.
 * The sfnt data starts after the header; we find it by looking for
 * the sfnt magic bytes (0x00010000, 0x4F54544F, 0x74727565, 0x74797031).
 */
function extractSfntFromEot(eotBuf: Buffer): Buffer {
  // EOT header starts with: eotSize (4), fontDataSize (4), version (4)...
  // The simplest approach: scan for sfnt magic
  const sfntMagics = [
    Buffer.from([0x00, 0x01, 0x00, 0x00]),
    Buffer.from([0x4F, 0x54, 0x54, 0x4F]),
    Buffer.from([0x74, 0x72, 0x75, 0x65]),
    Buffer.from([0x74, 0x79, 0x70, 0x31]),
  ];

  for (let i = 0; i < eotBuf.length - 4; i++) {
    for (const magic of sfntMagics) {
      if (eotBuf[i] === magic[0] && eotBuf[i+1] === magic[1] &&
          eotBuf[i+2] === magic[2] && eotBuf[i+3] === magic[3]) {
        return eotBuf.slice(i);
      }
    }
  }

  // Fallback: skip fixed EOT header (variable, but commonly 82+ bytes)
  // Use the fontDataSize field at offset 4
  const fontDataSize = eotBuf.readUInt32LE(4);
  const headerSize = eotBuf.length - fontDataSize;
  if (headerSize > 0 && headerSize < eotBuf.length) {
    return eotBuf.slice(headerSize);
  }

  return eotBuf;
}

export const maxDuration = 30;
