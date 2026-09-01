import { describe, expect, it } from "vitest";
import type {
  ExecutionContract,
  ExecutionContext,
} from "../execution.contract.js";

describe("ExecutionAuthorizationBoundaryContract", () => {
  it("accepts execution when tenant and task contexts match", async () => {
    const context: ExecutionContext = {
      tenant: {
        organizationId: "org-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
      },
      task: {
        id: "task-auth-1",
        type: "process",
        input: {},
        context: {
          organizationId: "org-1",
          workspaceId: "workspace-1",
          projectId: "project-1",
        },
        constraints: {},
        metadata: {
          createdAt: "2026-08-31T00:00:00.000Z",
          correlationId: "execution-auth-test-1",
        },
      },
    };

    const execution: ExecutionContract = {
      async execute(received: ExecutionContext) {
        const authorized =
          received.tenant.organizationId ===
            received.task.context.organizationId &&
          received.tenant.workspaceId ===
            received.task.context.workspaceId &&
          received.tenant.projectId === received.task.context.projectId;

        if (!authorized) {
          throw new Error("UNAUTHORIZED_EXECUTION_CONTEXT");
        }

        return received;
      },
    };

    const result = await execution.execute(context);

    expect(result).toBe(context);
  });

  it("rejects execution when tenant and task contexts do not match", async () => {
    const context: ExecutionContext = {
      tenant: {
        organizationId: "org-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
      },
      task: {
        id: "task-auth-2",
        type: "process",
        input: {},
        context: {
          organizationId: "org-2",
          workspaceId: "workspace-2",
          projectId: "project-2",
        },
        constraints: {},
        metadata: {
          createdAt: "2026-08-31T00:00:00.000Z",
          correlationId: "execution-auth-test-2",
        },
      },
    };

    const execution: ExecutionContract = {
      async execute(received: ExecutionContext) {
        const authorized =
          received.tenant.organizationId ===
            received.task.context.organizationId &&
          received.tenant.workspaceId ===
            received.task.context.workspaceId &&
          received.tenant.projectId === received.task.context.projectId;

        if (!authorized) {
          throw new Error("UNAUTHORIZED_EXECUTION_CONTEXT");
        }

        return received;
      },
    };

    await expect(execution.execute(context)).rejects.toThrow(
      "UNAUTHORIZED_EXECUTION_CONTEXT",
    );
  });
});
