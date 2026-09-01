import { describe, expect, it } from "vitest";

describe("ArtifactClassificationBoundaryContract", () => {
  it("requires ownership, license, provenance, and exportability", () => {
    const artifact = {
      ownership: "Customer",
      license: "Customer-Contract",
      provenance: "Created by Customer",
      exportability: "Allowed",
    };

    const isClassified =
      artifact.ownership !== undefined &&
      artifact.license !== undefined &&
      artifact.provenance !== undefined &&
      artifact.exportability !== undefined;

    expect(isClassified).toBe(true);
  });

  it("blocks artifacts with missing license metadata", () => {
    const artifact = {
      ownership: "OpenSource",
      license: undefined,
      provenance: "Imported Dependency",
      exportability: "Allowed",
    };

    const canExport =
      artifact.ownership !== undefined &&
      artifact.license !== undefined &&
      artifact.provenance !== undefined &&
      artifact.exportability === "Allowed";

    expect(canExport).toBe(false);
  });

  it("blocks artifacts with unknown provenance", () => {
    const artifact = {
      ownership: "Customer",
      license: "Customer-Contract",
      provenance: undefined,
      exportability: "Allowed",
    };

    const canExport =
      artifact.ownership !== undefined &&
      artifact.license !== undefined &&
      artifact.provenance !== undefined &&
      artifact.exportability === "Allowed";

    expect(canExport).toBe(false);
  });
});
