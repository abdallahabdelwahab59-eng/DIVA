import { describe, expect, it } from "vitest";
import type { AgentContract } from "../agent.contract.js";
import type { TaskContract } from "../task.contract.js";

describe("AgentContract", () => {
  it("executes an assigned task and receives the exact TaskContract", async () => {
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

    const agent: AgentContract = {
      id: "agent-1",
      capability: "test",
      execute: async (receivedTask) => {
        expect(receivedTask).toEqual(task);
        return { ok: true };
      },
    };

    const result = await agent.execute(task);

    expect(result).toEqual({ ok: true });
  });
});
