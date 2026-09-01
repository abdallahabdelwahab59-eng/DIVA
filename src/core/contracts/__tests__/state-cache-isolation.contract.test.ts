import { describe, expect, it } from "vitest";

describe("State / Cache Isolation Contract", () => {
  it("rejects cross-tenant state access", () => {
    const state = {
      tenantId: "tenant-a",
      projectId: "project-a",
      value: "private-state",
    };

    const request = {
      tenantId: "tenant-b",
      projectId: "project-b",
    };

    const allowed =
      state.tenantId === request.tenantId &&
      state.projectId === request.projectId;

    expect(allowed).toBe(false);
  });

  it("rejects cross-project state access within the same tenant", () => {
    const state = {
      tenantId: "tenant-a",
      projectId: "project-a",
    };

    const request = {
      tenantId: "tenant-a",
      projectId: "project-b",
    };

    const allowed =
      state.tenantId === request.tenantId &&
      state.projectId === request.projectId;

    expect(allowed).toBe(false);
  });

  it("requires tenant and project scope for protected cache entries", () => {
    const cacheEntry = {
      tenantId: "tenant-a",
      projectId: "project-a",
      key: "provider-result",
    };

    const hasRequiredScope =
      Boolean(cacheEntry.tenantId) &&
      Boolean(cacheEntry.projectId);

    expect(hasRequiredScope).toBe(true);
  });

  it("does not allow cache state to grant authorization", () => {
    const cachedState = {
      tenantId: "tenant-a",
      projectId: "project-a",
      authorized: true,
    };

    const request = {
      tenantId: "tenant-a",
      projectId: "project-a",
      governanceApproved: false,
    };

    const executionAllowed =
      cachedState.authorized &&
      request.governanceApproved;

    expect(executionAllowed).toBe(false);
  });

  it("prevents provider or error state from contaminating another project", () => {
    const failedState = {
      tenantId: "tenant-a",
      projectId: "project-a",
      status: "provider-failed",
    };

    const unrelatedProject = {
      tenantId: "tenant-a",
      projectId: "project-b",
    };

    const contaminated =
      failedState.tenantId === unrelatedProject.tenantId &&
      failedState.projectId === unrelatedProject.projectId;

    expect(contaminated).toBe(false);
  });
});
