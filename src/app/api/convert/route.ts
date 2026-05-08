import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { promisify } from "util";
import path from "path";
import os from "os";
import crypto from "crypto";

const execAsync = promisify(exec);

const SUPPORTED_FORMATS = [".ttf", ".otf", ".eot", ".woff", ".woff2"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("font") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 10MB." },
        { status: 400 }
      );
    }

    // Validate extension
    const originalName = file.name.toLowerCase();
    const ext = path.extname(originalName);
    if (!SUPPORTED_FORMATS.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported format: ${ext}. Supported: ${SUPPORTED_FORMATS.join(", ")}` },
        { status: 400 }
      );
    }

    // Already WOFF2 — convert via fonttools to ensure optimization
    // (still run through fonttools to normalize/optimize)

    // Write to temp dir
    const tmpDir = path.join(os.tmpdir(), "fontina");
    await mkdir(tmpDir, { recursive: true });

    const id = crypto.randomBytes(8).toString("hex");
    const safeName = `${id}${ext}`;
    inputPath = path.join(tmpDir, safeName);
    outputPath = path.join(tmpDir, `${id}.woff2`);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    // Use fonttools to convert to WOFF2
    // fonttools fontmake is not needed — just pyftsubset or direct conversion
    // We use: python3 -c "from fontTools.ttLib import TTFont; ..."
    const pythonScript = `
import sys
from fontTools.ttLib import TTFont

input_path = sys.argv[1]
output_path = sys.argv[2]

font = TTFont(input_path)
font.flavor = "woff2"
font.save(output_path)
print("ok")
`;

    const scriptPath = path.join(tmpDir, `${id}_convert.py`);
    await writeFile(scriptPath, pythonScript);

    try {
      const { stdout, stderr } = await execAsync(
        `python3 "${scriptPath}" "${inputPath}" "${outputPath}"`,
        { timeout: 30000 }
      );

      if (!stdout.includes("ok")) {
        throw new Error(stderr || "Conversion script failed silently");
      }
    } catch (convErr: any) {
      return NextResponse.json(
        { error: "Conversion failed: " + (convErr.message || "Unknown error") },
        { status: 500 }
      );
    } finally {
      // Cleanup script
      unlink(scriptPath).catch(() => {});
    }

    // Read output
    const woff2Buffer = await readFile(outputPath);

    // Stream back
    const outputName = file.name.replace(/\.[^/.]+$/, "") + ".woff2";

    return new NextResponse(woff2Buffer, {
      status: 200,
      headers: {
        "Content-Type": "font/woff2",
        "Content-Disposition": `attachment; filename="${outputName}"`,
        "Content-Length": woff2Buffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[fontina] conversion error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    // Always clean up temp files
    if (inputPath) unlink(inputPath).catch(() => {});
    if (outputPath) unlink(outputPath).catch(() => {});
  }
}

// Vercel: allow up to 10MB body, 30s timeout
export const config = {
  api: {
    bodyParser: false,
  },
};

export const maxDuration = 30;
