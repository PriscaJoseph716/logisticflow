import type { Request, Response } from "express";
import { assignmentService } from "../services/assignment.service.js";
import { parsePermissions } from "../utils/roles.js";

function canManageAssignments(request: Request) {
  if (request.user?.role === "OWNER") return true;
  const permissions = parsePermissions(request.user?.customRole?.permissions);
  return permissions.includes("assignments:manage");
}

export class AssignmentsController {
  list = async (request: Request, response: Response) => {
    const items = await assignmentService.listAssignments({
      businessId: request.user!.businessId,
      userId: request.user!.id,
      isOwner: request.user!.role === "OWNER",
      canManage: canManageAssignments(request),
    });

    response.json({ success: true, assignments: items });
  };

  create = async (request: Request, response: Response) => {
    if (!canManageAssignments(request) && request.user!.role !== "OWNER") {
      response.status(403).json({ success: false, message: "Not allowed to assign work." });
      return;
    }

    const assignment = await assignmentService.createAssignment(request.user!.businessId, request.body);
    response.status(201).json({ success: true, assignment });
  };

  updateStatus = async (request: Request, response: Response) => {
    const assignment = await assignmentService.updateStatus(
      request.user!.businessId,
      request.params.id as string,
      request.user!.id,
      request.body.status,
      canManageAssignments(request) || request.user!.role === "OWNER",
    );

    response.json({ success: true, assignment });
  };

  uploadProof = async (request: Request, response: Response) => {
    const proof = await assignmentService.uploadProof({
      businessId: request.user!.businessId,
      assignmentId: request.params.id as string,
      userId: request.user!.id,
      canManage: canManageAssignments(request) || request.user!.role === "OWNER",
      fileName: request.body.fileName,
      mimeType: request.body.mimeType,
      base64Data: request.body.data,
    });

    response.status(201).json({ success: true, proof });
  };
}

export const assignmentsController = new AssignmentsController();
