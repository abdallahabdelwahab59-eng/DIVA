import type { TenantContext } from "./tenant-context.contract.js";

export interface ResultContract {
  success: boolean;
  output?: unknown;
  error?: unknown;
  tenant: TenantContext;
  correlationId: string;
}
