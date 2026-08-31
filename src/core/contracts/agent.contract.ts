import type { TaskContract } from "./task.contract.js";

export interface AgentContract {
  id: string;
  capability: string;
  execute(task: TaskContract): Promise<unknown>;
}
