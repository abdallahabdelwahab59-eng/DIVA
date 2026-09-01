import type { TaskContract } from "./task.contract.js";
import type { TenantContext } from "./tenant-context.contract.js";

export interface ExecutionContext {
  tenant: TenantContext;
  task: TaskContract;
}

export interface ExecutionContract {
  execute(context: ExecutionContext): Promise<unknown>;
}
