import { describe, expect, it } from "vitest";
import type { TenantContext } from "../tenant-context.contract.js";

describe("TenantContext Contract", () => {
  it("requires organization, workspace, and project identity", () => {
    const context: TenantContext = {
      organizationId: "org-1",
      workspaceId: "workspace-1",
      projectId: "project-1",
    };

    expect(context.organizationId).toBe("org-1");
    expect(context.workspaceId).toBe("workspace-1");
    expect(context.projectId).toBe("project-1");
  });
});
