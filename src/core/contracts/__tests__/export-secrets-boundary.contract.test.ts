import { describe, expect, it } from "vitest";

describe("ExportSecretsBoundaryContract", () => {
  it("blocks secrets from customer export", () => {
    const artifact = {
      ownership: "Customer",
      exportability: "Allowed",
      containsSecret: true,
    };

    const canExport =
      artifact.exportability === "Allowed" &&
      artifact.containsSecret === false;

    expect(canExport).toBe(false);
  });

  it("allows non-secret customer configuration to be exported", () => {
    const artifact = {
      ownership: "Customer",
      exportability: "Allowed",
      containsSecret: false,
    };

    const canExport =
      artifact.exportability === "Allowed" &&
      artifact.containsSecret === false;

    expect(canExport).toBe(true);
  });
});
