import { describe, expect, it } from "vitest";
import type { TenantContext } from "../tenant-context.contract.js";

type TenantIsolationDecision = "ALLOW" | "DENY";

const evaluateTenantIsolation = (
  requested: TenantContext | null,
  resource: TenantContext | null,
): TenantIsolationDecision => {
  if (!requested || !resource) {
    return "DENY";
  }

  if (
    requested.organizationId !== resource.organizationId ||
    requested.workspaceId !== resource.workspaceId ||
    requested.projectId !== resource.projectId
  ) {
    return "DENY";
  }

  return "ALLOW";
};

describe("Tenant Isolation Test Contract", () => {
  it("allows access only within the same tenant and project scope", () => {
    const context: TenantContext = {
      organizationId: "org-a",
      workspaceId: "workspace-a",
      projectId: "project-a",
    };

    expect(evaluateTenantIsolation(context, context)).toBe("ALLOW");
  });

  it("denies Tenant A access to Tenant B data", () => {
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

    expect(evaluateTenantIsolation(tenantA, tenantB)).toBe("DENY");
  });

  it("denies Tenant A access to a project owned by Tenant B", () => {
    const tenantA: TenantContext = {
      organizationId: "org-a",
      workspaceId: "workspace-a",
      projectId: "project-a",
    };

    const tenantBProject: TenantContext = {
      organizationId: "org-b",
      workspaceId: "workspace-b",
      projectId: "project-b",
    };

    expect(evaluateTenantIsolation(tenantA, tenantBProject)).toBe("DENY");
  });

  it("fails closed when required tenant context is missing", () => {
    const validContext: TenantContext = {
      organizationId: "org-a",
      workspaceId: "workspace-a",
      projectId: "project-a",
    };

    expect(evaluateTenantIsolation(null, validContext)).toBe("DENY");
    expect(evaluateTenantIsolation(validContext, null)).toBe("DENY");
  });

  it("denies hierarchy mismatch", () => {
    const requestedContext: TenantContext = {
      organizationId: "org-a",
      workspaceId: "workspace-a",
      projectId: "project-a",
    };

    const mismatchedHierarchy: TenantContext = {
      organizationId: "org-a",
      workspaceId: "workspace-b",
      projectId: "project-a",
    };

    expect(evaluateTenantIsolation(requestedContext, mismatchedHierarchy)).toBe(
      "DENY",
    );
  });
});
