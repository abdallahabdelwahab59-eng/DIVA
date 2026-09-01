import { describe, expect, it } from "vitest";

type Exportability = "Allowed" | "Blocked" | "Conditional";

interface Artifact {
  id: string;
  ownership: "Customer" | "OpenSource" | "Provider" | "DIVA Core" | "Unknown";
  exportability: Exportability;
}

const canExport = (artifact: Artifact): boolean => {
  if (artifact.ownership === "Unknown") {
    return false;
  }

  if (artifact.ownership === "DIVA Core") {
    return false;
  }

  return artifact.exportability === "Allowed";
};

describe("ExportArtifactBoundaryContract", () => {
  it("allows an explicitly exportable customer artifact", () => {
    const artifact: Artifact = {
      id: "customer-code-1",
      ownership: "Customer",
      exportability: "Allowed",
    };

    expect(canExport(artifact)).toBe(true);
  });

  it("blocks unknown artifacts", () => {
    const artifact: Artifact = {
      id: "unknown-1",
      ownership: "Unknown",
      exportability: "Allowed",
    };

    expect(canExport(artifact)).toBe(false);
  });

  it("blocks DIVA Core artifacts", () => {
    const artifact: Artifact = {
      id: "diva-core-1",
      ownership: "DIVA Core",
      exportability: "Blocked",
    };

    expect(canExport(artifact)).toBe(false);
  });

  it("blocks conditionally exportable artifacts without explicit approval", () => {
    const artifact: Artifact = {
      id: "conditional-1",
      ownership: "Provider",
      exportability: "Conditional",
    };

    expect(canExport(artifact)).toBe(false);
  });
});
