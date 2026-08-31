import { describe, expect, it } from "vitest";
import type { TaskContract } from "../task.contract.js";

describe("TaskContract", () => {
  it("represents a valid task with tenant context, constraints, and metadata", () => {
    const task: TaskContract = {
      id: "task-1",
      type: "test",
      input: { value: "test" },
      context: {
        organizationId: "org-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
      },
      constraints: {},
      metadata: {
        createdAt: "2026-08-31T00:00:00.000Z",
        correlationId: "test-correlation-1",
      },
    };

    expect(task.id).toBe("task-1");
    expect(task.type).toBe("test");
    expect(task.context.organizationId).toBe("org-1");
    expect(task.context.workspaceId).toBe("workspace-1");
    expect(task.context.projectId).toBe("project-1");
  });
});
