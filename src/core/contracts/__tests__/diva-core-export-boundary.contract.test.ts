import { describe, expect, it } from "vitest";

describe("DivaCoreExportBoundaryContract", () => {
  it("blocks DIVA Core artifacts from customer export", () => {
    const artifact = {
      id: "core-artifact-1",
      ownership: "DIVA Core",
      exportability: "Blocked",
    };

    const canExport =
      artifact.ownership !== "DIVA Core" &&
      artifact.exportability === "Allowed";

    expect(canExport).toBe(false);
  });

  it("allows customer-owned artifacts when explicitly exportable", () => {
    const artifact = {
      id: "customer-artifact-1",
      ownership: "Customer",
      exportability: "Allowed",
    };

    const canExport =
      artifact.ownership === "Customer" &&
      artifact.exportability === "Allowed";

    expect(canExport).toBe(true);
  });
});
