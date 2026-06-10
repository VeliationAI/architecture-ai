import { NextResponse } from "next/server";
import {
  DesignProjectSchema,
  submitForReview,
  approveProject,
  requestChanges,
  addApprovalComment,
  resolveComment,
} from "@architecture-ai/core";
import { z } from "zod";

const ApproveBodySchema = z.object({
  project: DesignProjectSchema,
  action: z.enum(["submit_review", "approve", "request_changes", "add_comment", "resolve_comment"]),
  signed_off_by: z.string().optional(),
  reason: z.string().optional(),
  comment: z
    .object({
      author: z.string().optional(),
      target_type: z.enum(["variant", "node", "table", "assumption"]),
      target_id: z.string(),
      comment: z.string(),
    })
    .optional(),
  comment_id: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = ApproveBodySchema.parse(await request.json());
    let project = body.project;

    switch (body.action) {
      case "submit_review":
        project = submitForReview(project);
        break;
      case "approve":
        project = approveProject(project, body.signed_off_by ?? "Reviewer");
        break;
      case "request_changes":
        project = requestChanges(project, body.reason ?? "Changes requested");
        break;
      case "add_comment":
        if (!body.comment) throw new Error("comment required");
        project = {
          ...project,
          approval: addApprovalComment(project.approval, {
            ...body.comment,
            author: body.comment.author ?? "Reviewer",
          }),
        };
        break;
      case "resolve_comment":
        if (!body.comment_id) throw new Error("comment_id required");
        project = {
          ...project,
          approval: resolveComment(project.approval, body.comment_id),
        };
        break;
    }

    return NextResponse.json({ project });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Approval action failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
