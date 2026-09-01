import { describe, expect, it } from "vitest";
import type { TenantContext } from "../tenant-context.contract.js";

interface AuthorizationRequest {
  tenant: TenantContext;
  requestedTenant: TenantContext;
  action: string;
}

const isAuthorized = (request: AuthorizationRequest): boolean => {
  return (
    request.tenant.organizationId === request.requestedTenant.organizationId &&
    request.tenant.workspaceId === request.requestedTenant.workspaceId &&
    request.tenant.projectId === request.requestedTenant.projectId
  );
};

describe("AuthorizationBoundaryContract", () => {
  it("allows access within the authorized tenant context", () => {
    const tenant: TenantContext = {
      organizationId: "org-1",
      workspaceId: "workspace-1",
      projectId: "project-1",
    };

    const request: AuthorizationRequest = {
      tenant,
      requestedTenant: tenant,
      action: "read-project",
    };

    expect(isAuthorized(request)).toBe(true);
  });

  it("denies access to another tenant context", () => {
    const authorizedTenant: TenantContext = {
      organizationId: "org-1",
      workspaceId: "workspace-1",
      projectId: "project-1",
    };

    const requestedTenant: TenantContext = {
      organizationId: "org-2",
      workspaceId: "workspace-2",
      projectId: "project-2",
    };

    const request: AuthorizationRequest = {
      tenant: authorizedTenant,
      requestedTenant,
      action: "read-project",
    };

    expect(isAuthorized(request)).toBe(false);
  });
});
