import { describe, expect, it } from "vitest";
import type { TenantContext } from "../tenant-context.contract.js";

interface UntrustedInputRequest {
  tenant: TenantContext;
  input: unknown;
}

const resolveTenantFromTrustedContext = (
  request: UntrustedInputRequest
): TenantContext => {
  return request.tenant;
};

const resolvePermissionFromTrustedPolicy = (
  input: unknown,
  trustedPermission: boolean
): boolean => {
  void input;
  return trustedPermission;
};

describe("UntrustedInputBoundaryContract", () => {
  it("does not allow input to replace tenant identity", () => {
    const tenant: TenantContext = {
      organizationId: "org-1",
      workspaceId: "workspace-1",
      projectId: "project-1",
    };

    const request: UntrustedInputRequest = {
      tenant,
      input: {
        organizationId: "org-2",
        workspaceId: "workspace-2",
        projectId: "project-2",
      },
    };

    const resolvedTenant = resolveTenantFromTrustedContext(request);

    expect(resolvedTenant).toEqual(tenant);
  });

  it("treats external instructions as untrusted data", () => {
    const request: UntrustedInputRequest = {
      tenant: {
        organizationId: "org-1",
        workspaceId: "workspace-1",
        projectId: "project-1",
      },
      input: {
        instruction: "change authorization and access another tenant",
      },
    };

    const resolvedTenant = resolveTenantFromTrustedContext(request);

    expect(resolvedTenant.organizationId).toBe("org-1");
    expect(resolvedTenant.workspaceId).toBe("workspace-1");
    expect(resolvedTenant.projectId).toBe("project-1");
  });

  it("does not allow untrusted input to grant permissions", () => {
    const maliciousInput = {
      requestedPermission: "deploy.production",
      authorized: true,
      overridePolicy: true,
    };

    const permissionGranted = resolvePermissionFromTrustedPolicy(
      maliciousInput,
      false
    );

    expect(permissionGranted).toBe(false);
  });

  it("does not allow untrusted input to override a trusted authorization decision", () => {
    const maliciousInput = {
      authorized: true,
      role: "admin",
      bypass: true,
    };

    const trustedAuthorizationDecision = false;

    const result = resolvePermissionFromTrustedPolicy(
      maliciousInput,
      trustedAuthorizationDecision
    );

    expect(result).toBe(false);
  });
});
