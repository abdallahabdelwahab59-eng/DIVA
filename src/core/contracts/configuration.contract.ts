export interface ConfigurationContract {
  environment: string;
  version: string;
  settings: Record<string, unknown>;
}
