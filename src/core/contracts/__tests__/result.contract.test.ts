import { describe, expect, it } from "vitest";
import type { ResultContract } from "../result.contract.js";

describe("ResultContract", () => {
  it("represents a successful result with tenant and correlation identity", () => {
    const result: ResultContract = {
      success: true,
      output: { value: "done" },
      tenant: {
        organizationId: "org-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
      },
      correlationId: "result-test-1",
    };

    expect(result.success).toBe(true);
    expect(result.output).toEqual({ value: "done" });
    expect(result.tenant.projectId).toBe("project-1");
    expect(result.correlationId).toBe("result-test-1");
  });

  it("represents a failed result without requiring output", () => {
    const result: ResultContract = {
      success: false,
      error: { code: "TEST_FAILURE" },
      tenant: {
        organizationId: "org-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
      },
      correlationId: "result-test-2",
    };

    expect(result.success).toBe(false);
    expect(result.error).toEqual({ code: "TEST_FAILURE" });
    expect(result.output).toBeUndefined();
  });
});
