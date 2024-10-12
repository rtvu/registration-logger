import { describe, expect, test } from "vitest";

import { logGetRegistry, logSetRegistry, logNewRegistry } from "./index";

describe("Registry", () => {
  test("should get, set, and new", async () => {
    const firstRegistry = logGetRegistry();
    const secondRegistry = logNewRegistry();

    expect(firstRegistry).not.toBe(secondRegistry);

    logSetRegistry(firstRegistry);
    const shouldBeFirstRegistry = logGetRegistry();

    expect(firstRegistry).toBe(shouldBeFirstRegistry);
  });
});
