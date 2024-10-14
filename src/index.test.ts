import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi, MockInstance } from "vitest";

import {
  log,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logGetRegistry,
  logSetRegistry,
  logNewRegistry,
  logAddKey,
  logAddKeys,
  logUpdateKey,
  logUpdateKeys,
  LogLevel,
} from "./index";

describe("Registry", () => {
  beforeEach(() => {
    logNewRegistry();
  });

  afterAll(() => {
    logNewRegistry();
  });

  test("should get, set, and new the current registry", () => {
    const firstRegistry = logGetRegistry();
    const secondRegistry = logNewRegistry();

    expect(firstRegistry).not.toBe(secondRegistry);

    logSetRegistry(firstRegistry);
    const shouldBeFirstRegistry = logGetRegistry();

    expect(firstRegistry).toBe(shouldBeFirstRegistry);
  });

  test("should add new keys", () => {
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

  test("should discard keys if adding again", () => {
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

  test("should update new keys", () => {
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

  test("should update keeping lower level", () => {
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

describe("Log", () => {
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

  test("should log registered keys", () => {
    const result = "Info: key1: Logged";

    const key1 = { name: "key1" };
    const key2 = { name: "key2" };
    logUpdateKey(key1, LogLevel.Debug);

    log(key1, LogLevel.Info, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(1);
    expect(consoleLogMock.mock.results[0]).toEqual({ type: "return", value: result });

    log(key2, LogLevel.Info, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(1);
  });

  test("should log all enabled levels", () => {
    const key1 = { name: "key1" };
    const key2 = { name: "key2" };
    const key3 = { name: "key3" };
    logUpdateKey(key1, LogLevel.Debug);
    logUpdateKey(key2, LogLevel.Error);
    logUpdateKey(key3, LogLevel.Off);

    log(key1, LogLevel.Debug, "Logged");
    log(key1, LogLevel.Info, "Logged");
    log(key1, LogLevel.Warn, "Logged");
    log(key1, LogLevel.Error, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(4);

    log(key2, LogLevel.Debug, "Logged");
    log(key2, LogLevel.Info, "Logged");
    log(key2, LogLevel.Warn, "Logged");
    log(key2, LogLevel.Error, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(5);

    log(key3, LogLevel.Debug, "Logged");
    log(key3, LogLevel.Info, "Logged");
    log(key3, LogLevel.Warn, "Logged");
    log(key3, LogLevel.Error, "Logged");
    expect(consoleLogMock.mock.results.length).toBe(5);
  });
});

describe("Specific log", () => {
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
    const key1 = { name: "key1" };
    logUpdateKey(key1, LogLevel.Debug);

    const getResult = (levelDisplay: string) => `${levelDisplay}: key1: Logged`;

    logDebug(key1, "Logged");
    logInfo(key1, "Logged");
    logWarn(key1, "Logged");
    logError(key1, "Logged");

    expect(consoleLogMock.mock.results[0]).toEqual({ type: "return", value: getResult("Debug") });
    expect(consoleLogMock.mock.results[1]).toEqual({ type: "return", value: getResult("Info") });
    expect(consoleLogMock.mock.results[2]).toEqual({ type: "return", value: getResult("Warn") });
    expect(consoleLogMock.mock.results[3]).toEqual({ type: "return", value: getResult("Error") });
  });
});
