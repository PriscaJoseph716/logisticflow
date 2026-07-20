import type { Request, Response } from "express";
import { uploadService } from "../services/upload.service.js";

export class UploadsController {
  create = async (request: Request, response: Response) => {
    const multerFiles = request.files as
      | Array<{ originalname: string; mimetype: string; buffer: Buffer }>
      | undefined;

    const category =
      typeof request.body?.category === "string" ? request.body.category : "OTHER";

    const items =
      multerFiles && multerFiles.length > 0
        ? await uploadService.saveMulterFiles(multerFiles, category)
        : await uploadService.saveJsonFiles(request.body?.files ?? [], category);

    // unwrapApi returns `data`, and the frontend maps the upload array directly.
    response.status(201).json({ success: true, data: items });
  };
}

export const uploadsController = new UploadsController();
