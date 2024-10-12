import { beforeEach, afterAll, describe, expect, test } from "vitest";

import { logGetRegistry, logSetRegistry, logNewRegistry, logAddKey, logAddKeys, LogLevel } from "./index";

describe("Registry", () => {
  beforeEach(() => {
    logNewRegistry();
  });

  afterAll(() => {
    logNewRegistry();
  });

  test("should get, set, and new", async () => {
    const firstRegistry = logGetRegistry();
    const secondRegistry = logNewRegistry();

    expect(firstRegistry).not.toBe(secondRegistry);

    logSetRegistry(firstRegistry);
    const shouldBeFirstRegistry = logGetRegistry();

    expect(firstRegistry).toBe(shouldBeFirstRegistry);
  });

  test("should add keys", () => {
    const keys = [{ name: "key0" }, { name: "key1" }, { name: "key2" }, { name: "key3" }];
    const registry = logGetRegistry();

    logAddKey(keys[0], LogLevel.Off);
    logAddKeys([
      [keys[1], LogLevel.Off],
      [keys[2], LogLevel.Off],
    ]);

    for (let i = 0; i < keys.length - 1; i++) {
      expect(registry.has(keys[i])).toEqual(true);
    }

    expect(registry.has(keys[3])).toEqual(false);
  });

  test("should keep lowest level", () => {
    const key = { name: "key" };
    const registry = logGetRegistry();

    logAddKey(key, LogLevel.Warn);
    expect(registry.get(key)).toEqual(LogLevel.Warn);

    logAddKey(key, LogLevel.Error);
    expect(registry.get(key)).toEqual(LogLevel.Warn);

    logAddKey(key, LogLevel.Info);
    expect(registry.get(key)).toEqual(LogLevel.Info);

    const key1 = { name: "key1" };
    const key2 = { name: "key2" };

    logAddKeys([
      [key1, LogLevel.Warn],
      [key2, LogLevel.Warn],
      [key1, LogLevel.Error],
      [key2, LogLevel.Info],
    ]);
    expect(registry.get(key1)).toEqual(LogLevel.Warn);
    expect(registry.get(key2)).toEqual(LogLevel.Info);
  });
});
