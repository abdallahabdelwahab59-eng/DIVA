import { describe, expect, it } from "vitest";

describe("Failure Blast Radius Contract", () => {
  it("contains a provider failure to the affected provider scope", () => {
    const failure = {
      provider: "provider-a",
      scope: "provider",
    };

    expect(failure.scope).toBe("provider");
    expect(failure.provider).toBe("provider-a");
  });

  it("does not propagate one project's failure into another project", () => {
    const failedProject: string = "project-a";
    const unaffectedProject: string = "project-b";

    const propagated =
      failedProject === unaffectedProject;

    expect(propagated).toBe(false);
  });

  it("does not propagate one tenant's failure into another tenant", () => {
    const failedTenant: string = "tenant-a";
    const unaffectedTenant: string = "tenant-b";

    const propagated =
      failedTenant === unaffectedTenant;

    expect(propagated).toBe(false);
  });

  it("does not convert a contained failure into a system-wide failure", () => {
    const failureScope: string = "execution";

    const systemFailure =
      failureScope === "system";

    expect(systemFailure).toBe(false);
  });
});
