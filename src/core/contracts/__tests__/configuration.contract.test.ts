import { describe, expect, it } from "vitest";
import type { ConfigurationContract } from "../configuration.contract.js";

describe("ConfigurationContract", () => {
  it("represents non-secret runtime configuration", () => {
    const config: ConfigurationContract = {
      environment: "test",
      version: "1.0.0",
      settings: {
        featureEnabled: true,
        maxRetries: 3,
      },
    };

    expect(config.environment).toBe("test");
    expect(config.version).toBe("1.0.0");
    expect(config.settings.featureEnabled).toBe(true);
    expect(config.settings.maxRetries).toBe(3);
  });
});
