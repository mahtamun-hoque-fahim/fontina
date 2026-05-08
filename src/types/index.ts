export type ConversionStatus = "queued" | "converting" | "done" | "error";

export interface FontFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: ConversionStatus;
  downloadUrl?: string;
  outputName?: string;
  error?: string;
}
