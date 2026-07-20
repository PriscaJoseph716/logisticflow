import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { AppError } from "../utils/app-error.js";

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");

type JsonFileInput = {
  fileName: string;
  mimeType?: string;
  data: string;
};

export class UploadService {
  async saveJsonFiles(files: JsonFileInput[], category = "OTHER") {
    if (!Array.isArray(files) || files.length === 0) {
      throw new AppError("files array is required.");
    }

    await mkdir(UPLOAD_ROOT, { recursive: true });

    const items = [];
    for (const file of files) {
      if (!file?.fileName || !file?.data) {
        throw new AppError("Each file requires fileName and data.");
      }

      const raw = file.data.includes(",") ? file.data.split(",")[1] ?? "" : file.data;
      const buffer = Buffer.from(raw, "base64");
      if (!buffer.length) throw new AppError("Invalid file data.");

      const id = randomUUID();
      const safeName = `${Date.now()}-${id.slice(0, 8)}-${file.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await writeFile(path.join(UPLOAD_ROOT, safeName), buffer);

      items.push({
        id,
        fileName: file.fileName,
        fileUrl: `/uploads/${safeName}`,
        mimeType: file.mimeType || "application/octet-stream",
        category,
      });
    }

    return items;
  }

  async saveMulterFiles(
    files: Array<{ originalname: string; mimetype: string; buffer: Buffer }>,
    category = "OTHER",
  ) {
    if (!files?.length) throw new AppError("No files uploaded.");

    await mkdir(UPLOAD_ROOT, { recursive: true });

    const items = [];
    for (const file of files) {
      const id = randomUUID();
      const safeName = `${Date.now()}-${id.slice(0, 8)}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      await writeFile(path.join(UPLOAD_ROOT, safeName), file.buffer);

      items.push({
        id,
        fileName: file.originalname,
        fileUrl: `/uploads/${safeName}`,
        mimeType: file.mimetype || "application/octet-stream",
        category,
      });
    }

    return items;
  }
}

export const uploadService = new UploadService();
