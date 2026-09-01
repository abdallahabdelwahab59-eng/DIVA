import type { TaskContract } from "./task.contract.js";
import type { TenantContext } from "./tenant-context.contract.js";

export interface ExecutionAdmission {
    admissionId: string;
    executionId: string;
    tenantId: string;
    projectId: string;
    operation: string;
    authorizationDecisionId: string;
    policyVersion: string;
    issuedAt: number;
    expiresAt: number;
}

export interface ExecutionContext {
    tenant: TenantContext;
    task: TaskContract;
    admission: ExecutionAdmission;
}

export interface ExecutionContract {
    execute(context: ExecutionContext): Promise<unknown>;
}
