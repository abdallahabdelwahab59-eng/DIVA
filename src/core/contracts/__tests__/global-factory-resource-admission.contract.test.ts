import { describe, expect, it } from "vitest";

type ResourceState = {
  globalCapacity: number | null;
  globalReserved: number;
  tenantCapacity: number | null;
  tenantReserved: number;
  projectCapacity: number | null;
  projectReserved: number;
};

function canReserve(state: ResourceState, amount: number): boolean {
  if (
    state.globalCapacity === null ||
    state.tenantCapacity === null ||
    state.projectCapacity === null
  ) {
    return false;
  }

  return (
    amount > 0 &&
    state.globalReserved + amount <= state.globalCapacity &&
    state.tenantReserved + amount <= state.tenantCapacity &&
    state.projectReserved + amount <= state.projectCapacity
  );
}

function reserve(
  state: ResourceState,
  amount: number,
): boolean {
  if (!canReserve(state, amount)) {
    return false;
  }

  state.globalReserved += amount;
  state.tenantReserved += amount;
  state.projectReserved += amount;

  return true;
}

describe("Global Factory Resource Admission Contract", () => {
  it("allows a request within global, tenant, and project limits", () => {
    const state: ResourceState = {
      globalCapacity: 100,
      globalReserved: 20,
      tenantCapacity: 50,
      tenantReserved: 10,
      projectCapacity: 20,
      projectReserved: 5,
    };

    expect(reserve(state, 5)).toBe(true);
  });

  it("denies a request when tenant quota is exceeded", () => {
    const state: ResourceState = {
      globalCapacity: 100,
      globalReserved: 20,
      tenantCapacity: 20,
      tenantReserved: 20,
      projectCapacity: 20,
      projectReserved: 5,
    };

    expect(reserve(state, 1)).toBe(false);
  });

  it("denies a request when project quota is exceeded", () => {
    const state: ResourceState = {
      globalCapacity: 100,
      globalReserved: 20,
      tenantCapacity: 50,
      tenantReserved: 10,
      projectCapacity: 10,
      projectReserved: 10,
    };

    expect(reserve(state, 1)).toBe(false);
  });

  it("denies a request when global capacity is exhausted", () => {
    const state: ResourceState = {
      globalCapacity: 100,
      globalReserved: 100,
      tenantCapacity: 100,
      tenantReserved: 10,
      projectCapacity: 50,
      projectReserved: 5,
    };

    expect(reserve(state, 1)).toBe(false);
  });

  it("prevents global oversubscription during concurrent reservations", () => {
    const state: ResourceState = {
      globalCapacity: 10,
      globalReserved: 9,
      tenantCapacity: 10,
      tenantReserved: 9,
      projectCapacity: 10,
      projectReserved: 9,
    };

    const first = reserve(state, 1);
    const second = reserve(state, 1);

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(state.globalReserved).toBe(10);
  });

  it("prevents one tenant from monopolizing the global factory", () => {
    const tenantA: ResourceState = {
      globalCapacity: 10,
      globalReserved: 0,
      tenantCapacity: 5,
      tenantReserved: 0,
      projectCapacity: 5,
      projectReserved: 0,
    };

    const tenantB: ResourceState = {
      globalCapacity: 10,
      globalReserved: 0,
      tenantCapacity: 5,
      tenantReserved: 0,
      projectCapacity: 5,
      projectReserved: 0,
    };

    expect(reserve(tenantA, 5)).toBe(true);
    expect(reserve(tenantA, 1)).toBe(false);
    expect(reserve(tenantB, 5)).toBe(true);
  });

  it("denies unknown capacity state", () => {
    const state: ResourceState = {
      globalCapacity: null,
      globalReserved: 0,
      tenantCapacity: 10,
      tenantReserved: 0,
      projectCapacity: 10,
      projectReserved: 0,
    };

    expect(reserve(state, 1)).toBe(false);
  });

  it("does not change reservation state after a denied request", () => {
    const state: ResourceState = {
      globalCapacity: 10,
      globalReserved: 10,
      tenantCapacity: 10,
      tenantReserved: 10,
      projectCapacity: 10,
      projectReserved: 10,
    };

    expect(reserve(state, 1)).toBe(false);
    expect(state.globalReserved).toBe(10);
    expect(state.tenantReserved).toBe(10);
    expect(state.projectReserved).toBe(10);
  });

  it("does not double-reserve the same available capacity", () => {
    const state: ResourceState = {
      globalCapacity: 5,
      globalReserved: 0,
      tenantCapacity: 5,
      tenantReserved: 0,
      projectCapacity: 5,
      projectReserved: 0,
    };

    expect(reserve(state, 5)).toBe(true);
    expect(reserve(state, 5)).toBe(false);
    expect(state.globalReserved).toBe(5);
  });
});
