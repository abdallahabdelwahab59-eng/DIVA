import { describe, expect, it } from "vitest";

interface ExportArtifact {
  id: string;
  exportable: boolean;
  containsSecret: boolean;
}

const canExportArtifact = (artifact: ExportArtifact): boolean => {
  if (artifact.containsSecret) {
    return false;
  }

  return artifact.exportable;
};

describe("SecretsExportBoundaryContract", () => {
  it("allows an exportable artifact without secrets", () => {
    const artifact: ExportArtifact = {
      id: "app-1",
      exportable: true,
      containsSecret: false,
    };

    expect(canExportArtifact(artifact)).toBe(true);
  });

  it("blocks an artifact containing secrets", () => {
    const artifact: ExportArtifact = {
      id: "app-with-secret-1",
      exportable: true,
      containsSecret: true,
    };

    expect(canExportArtifact(artifact)).toBe(false);
  });

  it("blocks secrets even when the artifact is otherwise exportable", () => {
    const artifact: ExportArtifact = {
      id: "config-1",
      exportable: true,
      containsSecret: true,
    };

    expect(canExportArtifact(artifact)).toBe(false);
  });

  it("blocks an artifact when exportability is false", () => {
    const artifact: ExportArtifact = {
      id: "protected-1",
      exportable: false,
      containsSecret: false,
    };

    expect(canExportArtifact(artifact)).toBe(false);
  });
});
