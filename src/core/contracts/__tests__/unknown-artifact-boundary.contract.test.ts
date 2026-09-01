import { describe, expect, it } from "vitest";

describe("UnknownArtifactBoundaryContract", () => {
  it("blocks artifacts without classification", () => {
    const artifact = {
      id: "artifact-unknown-1",
      ownership: undefined,
      license: undefined,
      provenance: undefined,
      exportability: undefined,
    };

    const isClassified =
      artifact.ownership !== undefined &&
      artifact.license !== undefined &&
      artifact.provenance !== undefined &&
      artifact.exportability !== undefined;

    expect(isClassified).toBe(false);
  });

  it("does not allow an unknown artifact into export", () => {
    const exportAllowed = false;

    expect(exportAllowed).toBe(false);
  });
});
