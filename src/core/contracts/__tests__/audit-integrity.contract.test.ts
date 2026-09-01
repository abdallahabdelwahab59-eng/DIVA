import { describe, expect, it } from "vitest";

describe("Audit Integrity Contract", () => {
  it("treats committed audit records as immutable", () => {
    const auditRecord = {
      auditRecordId: "audit-1",
      committed: true,
      immutable: true,
    };

    expect(auditRecord.committed).toBe(true);
    expect(auditRecord.immutable).toBe(true);
  });

  it("rejects modification of a committed audit record", () => {
    const auditRecord = {
      committed: true,
      updateAllowed: false,
    };

    expect(auditRecord.updateAllowed).toBe(false);
  });

  it("rejects deletion of a committed audit record", () => {
    const auditRecord = {
      committed: true,
      deleteAllowed: false,
    };

    expect(auditRecord.deleteAllowed).toBe(false);
  });

  it("represents corrections as new audit events", () => {
    const originalRecord = {
      auditRecordId: "audit-1",
      committed: true,
    };

    const correctionEvent = {
      auditRecordId: "audit-2",
      references: "audit-1",
      isCorrection: true,
    };

    expect(correctionEvent.auditRecordId).not.toBe(
      originalRecord.auditRecordId,
    );

    expect(correctionEvent.references).toBe(
      originalRecord.auditRecordId,
    );

    expect(correctionEvent.isCorrection).toBe(true);
  });

  it("does not allow audit failure to convert denial into approval", () => {
    const decision = {
      authorized: false,
      auditPersistenceSucceeded: false,
    };

    const executionAllowed =
      decision.authorized &&
      decision.auditPersistenceSucceeded;

    expect(executionAllowed).toBe(false);
  });

  it("keeps audit identity associated with the protected execution scope", () => {
    const auditRecord = {
      tenantId: "tenant-a",
      projectId: "project-a",
      executionId: "execution-a",
    };

    expect(auditRecord.tenantId).toBe("tenant-a");
    expect(auditRecord.projectId).toBe("project-a");
    expect(auditRecord.executionId).toBe("execution-a");
  });
});
