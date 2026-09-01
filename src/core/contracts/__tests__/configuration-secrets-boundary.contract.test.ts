import { describe, expect, it } from "vitest";
import type { ConfigurationContract } from "../configuration.contract.js";

describe("ConfigurationSecretsBoundaryContract", () => {
  it("represents runtime settings without secret credentials", () => {
    const configuration: ConfigurationContract = {
      environment: "test",
      version: "1.0.0",
      settings: {
        featureEnabled: true,
        maxRetries: 3,
      },
    };

    expect(configuration.settings.featureEnabled).toBe(true);
    expect(configuration.settings.maxRetries).toBe(3);

    expect(configuration.settings).not.toHaveProperty("apiKey");
    expect(configuration.settings).not.toHaveProperty("secret");
    expect(configuration.settings).not.toHaveProperty("password");
    expect(configuration.settings).not.toHaveProperty("token");
  });
});
