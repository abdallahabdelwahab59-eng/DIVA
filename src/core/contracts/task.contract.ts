export interface TaskContext {
  organizationId: string;
  workspaceId: string;
  projectId: string;
}

export interface TaskConstraints {
  timeoutMs?: number;
  maxCost?: number;
  allowedCapabilities?: string[];
}

export interface TaskMetadata {
  createdAt: string;
  correlationId: string;
  source?: string;
}

export interface TaskContract {
  id: string;
  type: string;
  input: unknown;
  context: TaskContext;
  constraints: TaskConstraints;
  metadata: TaskMetadata;
}
