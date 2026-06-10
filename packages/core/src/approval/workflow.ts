import type { ApprovalState, ApprovalComment, DesignProject } from "../schema/project.js";

export function createEmptyApproval(): ApprovalState {
  return {
    status: "draft",
    comments: [],
    assumptions_pending: [],
  };
}

export function addApprovalComment(
  approval: ApprovalState,
  comment: Omit<ApprovalComment, "id" | "created_at" | "status">
): ApprovalState {
  return {
    ...approval,
    status: approval.status === "approved" ? "changes_requested" : "in_review",
    comments: [
      ...approval.comments,
      {
        ...comment,
        id: `comment-${Date.now()}`,
        status: "open",
        created_at: new Date().toISOString(),
      },
    ],
  };
}

export function resolveComment(approval: ApprovalState, commentId: string): ApprovalState {
  return {
    ...approval,
    comments: approval.comments.map((c) =>
      c.id === commentId ? { ...c, status: "resolved" as const } : c
    ),
  };
}

export function submitForReview(project: DesignProject): DesignProject {
  return {
    ...project,
    approval: {
      ...project.approval,
      status: "in_review",
      assumptions_pending: project.variant_bundle.risks_and_gaps ?? [],
    },
    updated_at: new Date().toISOString(),
  };
}

export function approveProject(
  project: DesignProject,
  signedOffBy: string
): DesignProject {
  const openComments = project.approval.comments.filter((c) => c.status === "open");
  if (openComments.length > 0) {
    return {
      ...project,
      approval: { ...project.approval, status: "changes_requested" },
    };
  }

  return {
    ...project,
    approval: {
      ...project.approval,
      status: "approved",
      approved_variant_id: project.active_variant_id,
      signed_off_at: new Date().toISOString(),
      signed_off_by: signedOffBy,
    },
    updated_at: new Date().toISOString(),
  };
}

export function requestChanges(project: DesignProject, reason: string): DesignProject {
  return {
    ...project,
    approval: {
      ...project.approval,
      status: "changes_requested",
      comments: [
        ...project.approval.comments,
        {
          id: `comment-${Date.now()}`,
          author: "Reviewer",
          target_type: "variant",
          target_id: project.active_variant_id,
          comment: reason,
          status: "open",
          created_at: new Date().toISOString(),
        },
      ],
    },
    updated_at: new Date().toISOString(),
  };
}
