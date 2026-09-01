import { describe, expect, it } from "vitest";

interface LicensedArtifact {
  id: string;
  license: string | null;
  exportable: boolean;
}

const canExportLicensedArtifact = (
  artifact: LicensedArtifact
): boolean => {
  if (!artifact.license) {
    return false;
  }

  return artifact.exportable;
};

describe("LicenseValidationBoundaryContract", () => {
  it("allows an artifact with a known license and export permission", () => {
    const artifact: LicensedArtifact = {
      id: "opensource-1",
      license: "MIT",
      exportable: true,
    };

    expect(canExportLicensedArtifact(artifact)).toBe(true);
  });

  it("blocks an artifact with an unknown license", () => {
    const artifact: LicensedArtifact = {
      id: "unknown-license-1",
      license: null,
      exportable: true,
    };

    expect(canExportLicensedArtifact(artifact)).toBe(false);
  });

  it("blocks an artifact that is licensed but not exportable", () => {
    const artifact: LicensedArtifact = {
      id: "protected-1",
      license: "Proprietary",
      exportable: false,
    };

    expect(canExportLicensedArtifact(artifact)).toBe(false);
  });

  it("does not treat an unknown license as automatically permissive", () => {
    const artifact: LicensedArtifact = {
      id: "unknown-2",
      license: null,
      exportable: true,
    };

    expect(canExportLicensedArtifact(artifact)).toBe(false);
  });
});
