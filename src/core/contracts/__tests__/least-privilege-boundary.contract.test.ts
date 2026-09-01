import { describe, expect, it } from "vitest";

interface Actor {
  id: string;
  permissions: string[];
}

const canPerform = (actor: Actor, action: string): boolean => {
  return actor.permissions.includes(action);
};

describe("LeastPrivilegeBoundaryContract", () => {
  it("allows an actor to perform an explicitly granted action", () => {
    const actor: Actor = {
      id: "actor-1",
      permissions: ["project.read"],
    };

    expect(canPerform(actor, "project.read")).toBe(true);
  });

  it("denies an action that was not explicitly granted", () => {
    const actor: Actor = {
      id: "actor-1",
      permissions: ["project.read"],
    };

    expect(canPerform(actor, "project.delete")).toBe(false);
  });

  it("does not treat a general capability as unlimited authority", () => {
    const actor: Actor = {
      id: "agent-1",
      permissions: ["data.process"],
    };

    expect(canPerform(actor, "project.delete")).toBe(false);
    expect(canPerform(actor, "deploy.production")).toBe(false);
  });
});
