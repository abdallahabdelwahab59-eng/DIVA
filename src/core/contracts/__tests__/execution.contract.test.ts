import { describe, expect, it } from "vitest";
import type {
  ExecutionContract,
  ExecutionContext,
} from "../execution.contract.js";

describe("Execution Contract", () => {
  it("executes with the exact tenant and task context", async () => {
    const context: ExecutionContext = {
      tenant: {
        organizationId: "org-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
      },
      task: {
        id: "task-1",
        type: "test",
        input: { value: "hello" },
        context: {
          organizationId: "org-1",
          workspaceId: "workspace-1",
          projectId: "project-1",
        },
        constraints: {},
        metadata: {
          createdAt: "2026-08-31T00:00:00.000Z",
          correlationId: "execution-test-1",
        },
      },
    };

    const execution: ExecutionContract = {
      async execute(received) {
        return received;
      },
    };

    const result = await execution.execute(context);

    expect(result).toBe(context);
    expect(context.tenant.projectId).toBe("project-1");
    expect(context.task.id).toBe("task-1");
  });
});
