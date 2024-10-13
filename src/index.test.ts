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
  LogLevel,
} from "./index";

describe("Registry", () => {
  beforeEach(() => {
    logNewRegistry();
  });

  afterAll(() => {
    logNewRegistry();
  });

  test("should get, set, and new", () => {
    const firstRegistry = logGetRegistry();
    const secondRegistry = logNewRegistry();

    expect(firstRegistry).not.toBe(secondRegistry);

    logSetRegistry(firstRegistry);
    const shouldBeFirstRegistry = logGetRegistry();

    expect(firstRegistry).toBe(shouldBeFirstRegistry);
  });

  test("should add keys", () => {
    const key0 = { name: "key0" };
    const key1 = { name: "key1" };
    const key2 = { name: "key2" };
    const key3 = { name: "key3" };
    const registry = logGetRegistry();

    logAddKey(key0, LogLevel.Off);
    logAddKeys([
      [key1, LogLevel.Off],
      [key2, LogLevel.Off],
    ]);
    expect(registry.has(key0)).toEqual(true);
    expect(registry.has(key1)).toEqual(true);
    expect(registry.has(key2)).toEqual(true);
    expect(registry.has(key3)).toEqual(false);
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
    logAddKey(key1, LogLevel.Debug);

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
    logAddKey(key1, LogLevel.Debug);
    logAddKey(key2, LogLevel.Error);
    logAddKey(key3, LogLevel.Off);

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
    logAddKey(key1, LogLevel.Debug);

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
