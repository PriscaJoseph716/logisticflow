import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");

export class AssignmentService {
  async listAssignments(input: {
    businessId: string;
    userId: string;
    isOwner: boolean;
    canManage: boolean;
  }) {
    const assignments = await prisma.assignment.findMany({
      where: {
        businessId: input.businessId,
        ...(input.isOwner || input.canManage ? {} : { workerId: input.userId }),
      },
      include: {
        worker: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        proofs: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return assignments.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      status: item.status,
      dueDate: item.dueDate,
      worker: item.worker,
      proofs: item.proofs.map((proof) => ({
        id: proof.id,
        fileName: proof.fileName,
        mimeType: proof.mimeType,
        url: `/uploads/${path.basename(proof.filePath)}`,
        createdAt: proof.createdAt,
      })),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  async createAssignment(
    businessId: string,
    input: {
      workerId: string;
      type: string;
      title: string;
      description?: string;
      dueDate?: string;
    },
  ) {
    const type = input.type.trim().toUpperCase();
    const title = input.title.trim();

    if (!input.workerId || !type || !title) {
      throw new AppError("workerId, type, and title are required.");
    }

    if (!["DELIVERY", "MAINTENANCE"].includes(type)) {
      throw new AppError("type must be DELIVERY or MAINTENANCE.");
    }

    const worker = await prisma.user.findFirst({
      where: {
        id: input.workerId,
        businessId,
        role: { not: "OWNER" },
      },
    });

    if (!worker) {
      throw new AppError("Worker not found in this business.", 404);
    }

    const assignment = await prisma.assignment.create({
      data: {
        businessId,
        workerId: worker.id,
        type,
        title,
        description: input.description?.trim() ?? "",
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        status: "PENDING",
      },
      include: {
        worker: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    });

    return assignment;
  }

  async updateStatus(
    businessId: string,
    assignmentId: string,
    userId: string,
    status: string,
    canManage: boolean,
  ) {
    const normalized = status.trim().toUpperCase();
    if (!["PENDING", "IN_PROGRESS", "COMPLETED"].includes(normalized)) {
      throw new AppError("Invalid status.");
    }

    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, businessId },
    });

    if (!assignment) {
      throw new AppError("Assignment not found.", 404);
    }

    if (!canManage && assignment.workerId !== userId) {
      throw new AppError("You can only update your own assignments.", 403);
    }

    return prisma.assignment.update({
      where: { id: assignment.id },
      data: { status: normalized },
    });
  }

  async uploadProof(input: {
    businessId: string;
    assignmentId: string;
    userId: string;
    canManage: boolean;
    fileName: string;
    mimeType: string;
    base64Data: string;
  }) {
    const assignment = await prisma.assignment.findFirst({
      where: { id: input.assignmentId, businessId: input.businessId },
    });

    if (!assignment) {
      throw new AppError("Assignment not found.", 404);
    }

    if (!input.canManage && assignment.workerId !== input.userId) {
      throw new AppError("You can only upload proof for your assignments.", 403);
    }

    if (!input.base64Data || !input.fileName) {
      throw new AppError("fileName and file data are required.");
    }

    const raw = input.base64Data.includes(",")
      ? input.base64Data.split(",")[1] ?? ""
      : input.base64Data;

    const buffer = Buffer.from(raw, "base64");
    if (!buffer.length) {
      throw new AppError("Invalid file data.");
    }

    await mkdir(UPLOAD_ROOT, { recursive: true });
    const safeName = `${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(UPLOAD_ROOT, safeName);
    await writeFile(filePath, buffer);

    const proof = await prisma.proof.create({
      data: {
        assignmentId: assignment.id,
        uploadedById: input.userId,
        fileName: input.fileName,
        filePath,
        mimeType: input.mimeType || "application/octet-stream",
      },
    });

    if (assignment.status === "PENDING") {
      await prisma.assignment.update({
        where: { id: assignment.id },
        data: { status: "IN_PROGRESS" },
      });
    }

    return {
      id: proof.id,
      fileName: proof.fileName,
      mimeType: proof.mimeType,
      url: `/uploads/${safeName}`,
      createdAt: proof.createdAt,
    };
  }
}

export const assignmentService = new AssignmentService();
