import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi, MockInstance } from "vitest";

import {
  log,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logGetLevelDisplay,
  logGetRegistry,
  logSetRegistry,
  logNewRegistry,
  logGetOverrideLevel,
  logSetOverrideLevel,
  logWrapOverride,
  logAddKey,
  logAddKeys,
  logSetKey,
  logSetKeys,
  logUpdateKey,
  logUpdateKeys,
  LogLevel,
} from "./index";

describe("Levels", () => {
  test("can get display", () => {
    expect(logGetLevelDisplay(LogLevel.Debug)).toBe("Debug");
    expect(logGetLevelDisplay(LogLevel.Info)).toBe("Info");
    expect(logGetLevelDisplay(LogLevel.Warn)).toBe("Warn");
    expect(logGetLevelDisplay(LogLevel.Error)).toBe("Error");
    expect(logGetLevelDisplay(LogLevel.Off)).toBe("Off");
  });
});

describe("Registry", () => {
  beforeEach(() => {
    logNewRegistry();
  });

  afterAll(() => {
    logNewRegistry();
  });

  test("can be gotten, set, and newed", () => {
    const firstRegistry = logGetRegistry();
    const secondRegistry = logNewRegistry();
    expect(firstRegistry).not.toBe(secondRegistry);

    logSetRegistry(firstRegistry);
    const shouldBeFirstRegistry = logGetRegistry();
    expect(firstRegistry).toBe(shouldBeFirstRegistry);
  });
});

describe("Keys", () => {
  beforeEach(() => {
    logNewRegistry();
  });

  afterAll(() => {
    logNewRegistry();
  });

  test("can be added", () => {
    const key0 = { name: "key0" };
    const key1 = { name: "key1" };
    const key2 = { name: "key2" };
    const key3 = { name: "key3" };
    const key4 = { name: "key4" };
    const key5 = { name: "key5" };
    const registry = logGetRegistry();

    logAddKey(key0, LogLevel.Off);
    logAddKeys([
      [key1, LogLevel.Debug],
      [key2, LogLevel.Info],
      [key3, LogLevel.Warn],
      [key4, LogLevel.Error],
    ]);
    expect(registry.get(key0)).toBe(LogLevel.Off);
    expect(registry.get(key1)).toBe(LogLevel.Debug);
    expect(registry.get(key2)).toBe(LogLevel.Info);
    expect(registry.get(key3)).toBe(LogLevel.Warn);
    expect(registry.get(key4)).toBe(LogLevel.Error);
    expect(registry.get(key5)).toBe(undefined);
  });

  test("should be discarded if added again", () => {
    const key0 = { name: "key0" };
    const key1 = { name: "key1" };
    const registry = logGetRegistry();

    logAddKeys([
      [key0, LogLevel.Off],
      [key1, LogLevel.Off],
    ]);

    const isAdded = logAddKey(key0, LogLevel.Info);
    expect(isAdded).toBe(false);
    expect(registry.get(key0)).toBe(LogLevel.Off);

    const acceptedAndDiscarded = logAddKeys([
      [key0, LogLevel.Info],
      [key1, LogLevel.Info],
    ]);
    expect(acceptedAndDiscarded).toEqual([[], [key0, key1]]);
    expect(registry.get(key0)).toBe(LogLevel.Off);
    expect(registry.get(key1)).toBe(LogLevel.Off);
  });

  test("can be set", () => {
    const key0 = { name: "key0" };
    const key1 = { name: "key1" };
    const registry = logGetRegistry();

    logSetKey(key0, LogLevel.Warn);
    expect(registry.get(key0)).toBe(LogLevel.Warn);

    logSetKey(key0, LogLevel.Error);
    expect(registry.get(key0)).toBe(LogLevel.Error);

    logSetKey(key0, LogLevel.Info);
    expect(registry.get(key0)).toBe(LogLevel.Info);

    logSetKeys([
      [key0, LogLevel.Warn],
      [key1, LogLevel.Warn],
    ]);
    expect(registry.get(key0)).toBe(LogLevel.Warn);
    expect(registry.get(key1)).toBe(LogLevel.Warn);

    logSetKeys([
      [key0, LogLevel.Error],
      [key1, LogLevel.Info],
    ]);
    expect(registry.get(key0)).toBe(LogLevel.Error);
    expect(registry.get(key1)).toBe(LogLevel.Info);
  });

  test("can be updated", () => {
    const key0 = { name: "key0" };
    const key1 = { name: "key1" };
    const key2 = { name: "key2" };
    const key3 = { name: "key3" };
    const key4 = { name: "key4" };
    const key5 = { name: "key5" };
    const registry = logGetRegistry();

    logUpdateKey(key0, LogLevel.Off);
    logUpdateKeys([
      [key1, LogLevel.Debug],
      [key2, LogLevel.Info],
      [key3, LogLevel.Warn],
      [key4, LogLevel.Error],
    ]);
    expect(registry.get(key0)).toBe(LogLevel.Off);
    expect(registry.get(key1)).toBe(LogLevel.Debug);
    expect(registry.get(key2)).toBe(LogLevel.Info);
    expect(registry.get(key3)).toBe(LogLevel.Warn);
    expect(registry.get(key4)).toBe(LogLevel.Error);
    expect(registry.get(key5)).toBe(undefined);
  });

  test("should keep lower level if updated again", () => {
    const key0 = { name: "key0" };
    const key1 = { name: "key1" };
    const key2 = { name: "key2" };
    const registry = logGetRegistry();

    logUpdateKey(key0, LogLevel.Warn);
    expect(registry.get(key0)).toBe(LogLevel.Warn);

    logUpdateKey(key0, LogLevel.Error);
    expect(registry.get(key0)).toBe(LogLevel.Warn);

    logUpdateKey(key0, LogLevel.Info);
    expect(registry.get(key0)).toBe(LogLevel.Info);

    logUpdateKeys([
      [key1, LogLevel.Warn],
      [key2, LogLevel.Warn],
    ]);
    expect(registry.get(key1)).toBe(LogLevel.Warn);
    expect(registry.get(key2)).toBe(LogLevel.Warn);

    logUpdateKeys([
      [key1, LogLevel.Error],
      [key2, LogLevel.Info],
    ]);
    expect(registry.get(key1)).toBe(LogLevel.Warn);
    expect(registry.get(key2)).toBe(LogLevel.Info);
  });
});

describe("Logging", () => {
  let consoleLogMock: MockInstance<(...data: unknown[]) => void>;

  beforeAll(() => {
    consoleLogMock = vi.spyOn(console, "log").mockImplementation((...data: unknown[]) => data.join(" "));
  });

  beforeEach(() => {
    logNewRegistry();
  });

  afterEach(() => {
    consoleLogMock.mockClear();
  });

  afterAll(() => {
    logNewRegistry();
    consoleLogMock.mockRestore();
  });

  test("should log only registered keys", () => {
    const result = "Info: key0: Logged";

    const key0 = { name: "key0" };
    const key1 = { name: "key1" };
    logUpdateKey(key0, LogLevel.Debug);

    log(key0, LogLevel.Info, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(1);
    expect(consoleLogMock.mock.results[0]).toEqual({ type: "return", value: result });

    log(key1, LogLevel.Info, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(1);
  });

  test("should log all enabled levels", () => {
    const key0 = { name: "key0" };
    const key1 = { name: "key1" };
    const key2 = { name: "key2" };
    logUpdateKey(key0, LogLevel.Debug);
    logUpdateKey(key1, LogLevel.Error);
    logUpdateKey(key2, LogLevel.Off);

    log(key0, LogLevel.Debug, "Logged");
    log(key0, LogLevel.Info, "Logged");
    log(key0, LogLevel.Warn, "Logged");
    log(key0, LogLevel.Error, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(4);

    log(key1, LogLevel.Debug, "Logged");
    log(key1, LogLevel.Info, "Logged");
    log(key1, LogLevel.Warn, "Logged");
    log(key1, LogLevel.Error, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(5);

    log(key2, LogLevel.Debug, "Logged");
    log(key2, LogLevel.Info, "Logged");
    log(key2, LogLevel.Warn, "Logged");
    log(key2, LogLevel.Error, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(5);
  });
});

describe("Specific logging", () => {
  let consoleLogMock: MockInstance<(...data: unknown[]) => void>;

  beforeAll(() => {
    consoleLogMock = vi.spyOn(console, "log").mockImplementation((...data: unknown[]) => data.join(" "));
  });

  beforeEach(() => {
    logNewRegistry();
  });

  afterEach(() => {
    consoleLogMock.mockClear();
  });

  afterAll(() => {
    logNewRegistry();
    consoleLogMock.mockRestore();
  });

  test("should log specified level", () => {
    const key0 = { name: "key0" };
    logUpdateKey(key0, LogLevel.Debug);

    const getResult = (levelDisplay: string) => `${levelDisplay}: key0: Logged`;

    logDebug(key0, "Logged");
    logInfo(key0, "Logged");
    logWarn(key0, "Logged");
    logError(key0, "Logged");
    expect(consoleLogMock.mock.results[0]).toEqual({ type: "return", value: getResult("Debug") });
    expect(consoleLogMock.mock.results[1]).toEqual({ type: "return", value: getResult("Info") });
    expect(consoleLogMock.mock.results[2]).toEqual({ type: "return", value: getResult("Warn") });
    expect(consoleLogMock.mock.results[3]).toEqual({ type: "return", value: getResult("Error") });
  });
});

describe("Override logging", () => {
  let consoleLogMock: MockInstance<(...data: unknown[]) => void>;

  beforeAll(() => {
    consoleLogMock = vi.spyOn(console, "log").mockImplementation((...data: unknown[]) => data.join(" "));
  });

  beforeEach(() => {
    logNewRegistry();
    logSetOverrideLevel(LogLevel.Off);
  });

  afterEach(() => {
    consoleLogMock.mockClear();
  });

  afterAll(() => {
    logNewRegistry();
    logSetOverrideLevel(LogLevel.Off);
    consoleLogMock.mockRestore();
  });

  test("can set override level", () => {
    let overrideLevel = LogLevel.Off;

    logSetOverrideLevel(LogLevel.Error);
    overrideLevel = logGetOverrideLevel();
    expect(overrideLevel).toBe(LogLevel.Error);

    logSetOverrideLevel(LogLevel.Off);
    overrideLevel = logGetOverrideLevel();
    expect(overrideLevel).toBe(LogLevel.Off);
  });

  test("should log unregistered key", () => {
    const key0 = { name: "key0" };

    const getOverrideResult = (levelDisplay: string) => `(Override): ${levelDisplay}: key0: Logged`;

    logInfo(key0, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(0);

    logSetOverrideLevel(LogLevel.Error);

    logInfo(key0, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(0);

    logError(key0, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(1);
    expect(consoleLogMock.mock.results[0]).toEqual({ type: "return", value: getOverrideResult("Error") });

    logSetOverrideLevel(LogLevel.Off);

    logInfo(key0, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(1);
  });

  test("should log registered key", () => {
    const key0 = { name: "key0" };
    logUpdateKey(key0, LogLevel.Error);

    const getResult = (levelDisplay: string) => `${levelDisplay}: key0: Logged`;
    const getOverrideResult = (levelDisplay: string) => `(Override): ${levelDisplay}: key0: Logged`;

    logSetOverrideLevel(LogLevel.Debug);

    logError(key0, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(1);
    expect(consoleLogMock.mock.results[0]).toEqual({ type: "return", value: getResult("Error") });

    logDebug(key0, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(2);
    expect(consoleLogMock.mock.results[1]).toEqual({ type: "return", value: getOverrideResult("Debug") });

    logSetOverrideLevel(LogLevel.Off);

    logDebug(key0, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(2);
  });

  test("should log with wrapping", () => {
    const key0 = { name: "key0" };

    const getOverrideResult = (levelDisplay: string) => `(Override): ${levelDisplay}: key0: Logged`;

    const callback = () => {
      logDebug(key0, "Logged");
      logError(key0, "Logged");
    };

    callback();
    expect(consoleLogMock.mock.results.length).toBe(0);

    logWrapOverride(LogLevel.Error, () => {
      callback();
    });
    expect(consoleLogMock.mock.results.length).toBe(1);
    expect(consoleLogMock.mock.results[0]).toEqual({ type: "return", value: getOverrideResult("Error") });

    callback();
    expect(consoleLogMock.mock.results.length).toBe(1);
  });
});
