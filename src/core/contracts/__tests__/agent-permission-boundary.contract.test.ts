import { describe, expect, it } from "vitest";
import type { AgentContract } from "../agent.contract.js";
import type { TaskContract } from "../task.contract.js";

describe("Agent Permission Boundary", () => {
  it("treats agent capability as execution scope, not authorization", async () => {
    const task: TaskContract = {
      id: "task-permission-1",
      type: "test",
      input: {},
      context: {
        organizationId: "org-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
      },
      constraints: {},
      metadata: {
        createdAt: "2026-08-31T00:00:00.000Z",
        correlationId: "agent-permission-test-1",
      },
    };

    const agent: AgentContract = {
      id: "agent-1",
      capability: "test.execute",
      async execute(receivedTask) {
        return {
          capability: "test.execute",
          taskId: receivedTask.id,
        };
      },
    };

    const result = await agent.execute(task);

    expect(agent.capability).toBe("test.execute");
    expect(result).toEqual({
      capability: "test.execute",
      taskId: "task-permission-1",
    });
  });

  it("does not treat capability as a permission to change tenant identity", async () => {
    const task: TaskContract = {
      id: "task-permission-2",
      type: "test",
      input: {},
      context: {
        organizationId: "org-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
      },
      constraints: {},
      metadata: {
        createdAt: "2026-08-31T00:00:00.000Z",
        correlationId: "agent-permission-test-2",
      },
    };

    const agent: AgentContract = {
      id: "agent-2",
      capability: "test.execute",
      async execute(receivedTask) {
        return receivedTask.context;
      },
    };

    const result = await agent.execute(task);

    expect(result).toEqual({
      organizationId: "org-1",
      workspaceId: "workspace-1",
      projectId: "project-1",
    });

    expect(result).not.toEqual({
      organizationId: "org-2",
      workspaceId: "workspace-2",
      projectId: "project-2",
    });
  });
});
