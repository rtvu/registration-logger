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
  LogKey,
} from "./index";

let consoleLogMock: MockInstance<(...data: unknown[]) => void>;

const getLogResult = (key: LogKey, level: LogLevel, message: string): string => {
  const keyDisplay = "description" in key ? key.description : key.name;

  return `${logGetLevelDisplay(level)}: ${keyDisplay}: ${message}`;
};

const getLogOverrideResult = (key: LogKey, level: LogLevel, message: string): string => {
  return `(Override): ${getLogResult(key, level, message)}`;
};

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

    const isAdded = logAddKey(key0, LogLevel.Off);
    expect(isAdded).toBe(true);
    expect(registry.get(key0)).toBe(LogLevel.Off);

    const addedKeysAndNotAddedKeys = logAddKeys([
      [key1, LogLevel.Debug],
      [key2, LogLevel.Info],
      [key3, LogLevel.Warn],
      [key4, LogLevel.Error],
    ]);
    expect(addedKeysAndNotAddedKeys).toEqual([[key1, key2, key3, key4], []]);
    expect(registry.get(key1)).toBe(LogLevel.Debug);
    expect(registry.get(key2)).toBe(LogLevel.Info);
    expect(registry.get(key3)).toBe(LogLevel.Warn);
    expect(registry.get(key4)).toBe(LogLevel.Error);

    expect(registry.get(key5)).toBe(undefined);
  });

  test("should not be added if adding again", () => {
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

    logSetKey(key0, LogLevel.Off);
    expect(registry.get(key0)).toBe(LogLevel.Off);

    logSetKey(key0, LogLevel.Error);
    expect(registry.get(key0)).toBe(LogLevel.Error);

    logSetKey(key0, LogLevel.Warn);
    expect(registry.get(key0)).toBe(LogLevel.Warn);

    logSetKey(key0, LogLevel.Info);
    expect(registry.get(key0)).toBe(LogLevel.Info);

    logSetKey(key0, LogLevel.Debug);
    expect(registry.get(key0)).toBe(LogLevel.Debug);

    logSetKey(key0, LogLevel.Off);
    expect(registry.get(key0)).toBe(LogLevel.Off);

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

    const isUpdated = logUpdateKey(key0, LogLevel.Off);
    expect(isUpdated).toBe(true);
    expect(registry.get(key0)).toBe(LogLevel.Off);

    const updatedAndNotUpdated = logUpdateKeys([
      [key1, LogLevel.Debug],
      [key2, LogLevel.Info],
      [key3, LogLevel.Warn],
      [key4, LogLevel.Error],
    ]);
    expect(updatedAndNotUpdated).toEqual([[key1, key2, key3, key4], []]);
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

    logUpdateKeys([
      [key0, LogLevel.Warn],
      [key1, LogLevel.Warn],
      [key2, LogLevel.Warn],
    ]);

    let isUpdated = logUpdateKey(key0, LogLevel.Error);
    expect(isUpdated).toBe(false);
    expect(registry.get(key0)).toBe(LogLevel.Warn);

    isUpdated = logUpdateKey(key0, LogLevel.Info);
    expect(isUpdated).toBe(true);
    expect(registry.get(key0)).toBe(LogLevel.Info);

    const updatedKeysAndNotUpdatedKeys = logUpdateKeys([
      [key1, LogLevel.Error],
      [key2, LogLevel.Info],
    ]);
    expect(updatedKeysAndNotUpdatedKeys).toEqual([[key2], [key1]]);
    expect(registry.get(key1)).toBe(LogLevel.Warn);
    expect(registry.get(key2)).toBe(LogLevel.Info);
  });
});

describe("Logging", () => {
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
    const key0 = { name: "key0" };
    const key1 = { name: "key1" };
    logUpdateKey(key0, LogLevel.Debug);

    log(key0, LogLevel.Info, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(1);
    expect(consoleLogMock.mock.results[0]).toEqual({
      type: "return",
      value: getLogResult(key0, LogLevel.Info, "Logged"),
    });

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
    expect(consoleLogMock.mock.results[0]).toEqual({
      type: "return",
      value: getLogResult(key0, LogLevel.Debug, "Logged"),
    });
    expect(consoleLogMock.mock.results[1]).toEqual({
      type: "return",
      value: getLogResult(key0, LogLevel.Info, "Logged"),
    });
    expect(consoleLogMock.mock.results[2]).toEqual({
      type: "return",
      value: getLogResult(key0, LogLevel.Warn, "Logged"),
    });
    expect(consoleLogMock.mock.results[3]).toEqual({
      type: "return",
      value: getLogResult(key0, LogLevel.Error, "Logged"),
    });

    log(key1, LogLevel.Debug, "Logged");
    log(key1, LogLevel.Info, "Logged");
    log(key1, LogLevel.Warn, "Logged");
    log(key1, LogLevel.Error, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(5);
    expect(consoleLogMock.mock.results[4]).toEqual({
      type: "return",
      value: getLogResult(key1, LogLevel.Error, "Logged"),
    });

    log(key2, LogLevel.Debug, "Logged");
    log(key2, LogLevel.Info, "Logged");
    log(key2, LogLevel.Warn, "Logged");
    log(key2, LogLevel.Error, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(5);
  });
});

describe("Specific logging", () => {
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

    logDebug(key0, "Logged");
    logInfo(key0, "Logged");
    logWarn(key0, "Logged");
    logError(key0, "Logged");
    expect(consoleLogMock.mock.results[0]).toEqual({
      type: "return",
      value: getLogResult(key0, LogLevel.Debug, "Logged"),
    });
    expect(consoleLogMock.mock.results[1]).toEqual({
      type: "return",
      value: getLogResult(key0, LogLevel.Info, "Logged"),
    });
    expect(consoleLogMock.mock.results[2]).toEqual({
      type: "return",
      value: getLogResult(key0, LogLevel.Warn, "Logged"),
    });
    expect(consoleLogMock.mock.results[3]).toEqual({
      type: "return",
      value: getLogResult(key0, LogLevel.Error, "Logged"),
    });
  });
});

describe("Override logging", () => {
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

    logInfo(key0, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(0);

    logSetOverrideLevel(LogLevel.Error);

    logInfo(key0, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(0);

    logError(key0, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(1);
    expect(consoleLogMock.mock.results[0]).toEqual({
      type: "return",
      value: getLogOverrideResult(key0, LogLevel.Error, "Logged"),
    });

    logSetOverrideLevel(LogLevel.Off);

    logInfo(key0, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(1);
  });

  test("should log registered key", () => {
    const key0 = { name: "key0" };
    logUpdateKey(key0, LogLevel.Error);

    logSetOverrideLevel(LogLevel.Debug);

    logError(key0, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(1);
    expect(consoleLogMock.mock.results[0]).toEqual({
      type: "return",
      value: getLogResult(key0, LogLevel.Error, "Logged"),
    });

    logDebug(key0, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(2);
    expect(consoleLogMock.mock.results[1]).toEqual({
      type: "return",
      value: getLogOverrideResult(key0, LogLevel.Debug, "Logged"),
    });

    logSetOverrideLevel(LogLevel.Off);

    logDebug(key0, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(2);
  });

  test("should log with wrapping", () => {
    const key0 = { name: "key0" };

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
    expect(consoleLogMock.mock.results[0]).toEqual({
      type: "return",
      value: getLogOverrideResult(key0, LogLevel.Error, "Logged"),
    });

    callback();
    expect(consoleLogMock.mock.results.length).toBe(1);
  });
});
