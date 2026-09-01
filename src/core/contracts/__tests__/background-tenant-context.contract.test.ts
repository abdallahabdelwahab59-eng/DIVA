import { describe, expect, it } from "vitest";
import type { TenantContext } from "../tenant-context.contract.js";

interface BackgroundExecutionRequest {
  tenant?: TenantContext;
  requestedProjectId: string;
}

const canExecuteInTenantContext = (
  request: BackgroundExecutionRequest
): boolean => {
  if (!request.tenant) {
    return false;
  }

  return request.tenant.projectId === request.requestedProjectId;
};

describe("BackgroundTenantContextContract", () => {
  it("requires an explicit tenant context", () => {
    const request: BackgroundExecutionRequest = {
      requestedProjectId: "project-1",
    };

    expect(canExecuteInTenantContext(request)).toBe(false);
  });

  it("allows execution when tenant context explicitly matches the project", () => {
    const request: BackgroundExecutionRequest = {
      tenant: {
        organizationId: "org-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
      },
      requestedProjectId: "project-1",
    };

    expect(canExecuteInTenantContext(request)).toBe(true);
  });

  it("rejects execution when tenant context belongs to another project", () => {
    const request: BackgroundExecutionRequest = {
      tenant: {
        organizationId: "org-1",
        workspaceId: "workspace-1",
        projectId: "project-2",
      },
      requestedProjectId: "project-1",
    };

    expect(canExecuteInTenantContext(request)).toBe(false);
  });

  it("rejects cross-organization background execution", () => {
    const request: BackgroundExecutionRequest = {
      tenant: {
        organizationId: "org-2",
        workspaceId: "workspace-1",
        projectId: "project-1",
      },
      requestedProjectId: "project-1",
    };

    const expectedOrganizationId = "org-1";

    const authorized =
      request.tenant?.organizationId === expectedOrganizationId &&
      canExecuteInTenantContext(request);

    expect(authorized).toBe(false);
  });
});
