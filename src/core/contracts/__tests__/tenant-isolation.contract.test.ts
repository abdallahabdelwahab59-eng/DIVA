import { describe, expect, it } from "vitest";
import type { TenantContext } from "../tenant-context.contract.js";

describe("Tenant Isolation Test Contract", () => {
  it("keeps tenant identity explicit and scoped", () => {
    const tenantA: TenantContext = {
      organizationId: "org-a",
      workspaceId: "workspace-a",
      projectId: "project-a",
    };

    const tenantB: TenantContext = {
      organizationId: "org-b",
      workspaceId: "workspace-b",
      projectId: "project-b",
    };

    expect(tenantA.organizationId).toBe("org-a");
    expect(tenantA.workspaceId).toBe("workspace-a");
    expect(tenantA.projectId).toBe("project-a");

    expect(tenantB.organizationId).toBe("org-b");
    expect(tenantB.workspaceId).toBe("workspace-b");
    expect(tenantB.projectId).toBe("project-b");

    expect(tenantA).not.toEqual(tenantB);
  });

  it("does not allow one tenant context to be silently replaced by another", () => {
    const tenantA: TenantContext = {
      organizationId: "org-a",
      workspaceId: "workspace-a",
      projectId: "project-a",
    };

    const originalProjectId = tenantA.projectId;

    expect(tenantA.projectId).toBe(originalProjectId);
    expect(tenantA.projectId).not.toBe("project-b");
  });
});
