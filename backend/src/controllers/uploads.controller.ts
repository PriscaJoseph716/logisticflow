import type { Request, Response } from "express";
import { cloudinary } from "../config/cloudinary.js";
import { AppError } from "../utils/app-error.js";

function uploadBuffer(file: Express.Multer.File, folder?: string) {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  return cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "auto",
    use_filename: true,
    unique_filename: true,
  });
}

export class UploadsController {
  uploadFiles = async (request: Request, response: Response) => {
    const files = request.files as Express.Multer.File[] | undefined;

    if (!files?.length) {
      throw new AppError("At least one file is required.", 400, "UPLOAD_FILES_REQUIRED");
    }

    const folder = request.body.folder ? String(request.body.folder) : `logisticsflow/${request.user?.businessId ?? "shared"}`;
    const uploads = await Promise.all(files.map((file) => uploadBuffer(file, folder)));

    response.status(201).json({
      success: true,
      data: uploads.map((item, index) => ({
        id: item.asset_id,
        fileName: files[index].originalname,
        fileUrl: item.secure_url,
        mimeType: files[index].mimetype,
        category: request.body.category ? String(request.body.category) : "document",
        bytes: item.bytes,
      })),
    });
  };
}

export const uploadsController = new UploadsController();
