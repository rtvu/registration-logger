/**
 * Levels in increasing priority:
 *
 * * `Debug`
 * * `Info`
 * * `Warn`
 * * `Error`
 * * `Off`
 */
export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  Off = 4,
}

const logLevelDisplay: Record<LogLevel, string> = {
  [LogLevel.Debug]: "Debug",
  [LogLevel.Info]: "Info",
  [LogLevel.Warn]: "Warn",
  [LogLevel.Error]: "Error",
  [LogLevel.Off]: "Off",
};

/**
 * Keys are distinguished by reference. If both `description` and `name` properties are present, `description` will be used for logging.
 */
export type LogKey = { description: string } | { name: string };

export type LogRegistry = Map<LogKey, LogLevel>;

let currentRegistry: LogRegistry = new Map<LogKey, LogLevel>();

/**
 * Returns the current registry.
 *
 * @returns The current registry.
 */
export function logGetRegistry(): LogRegistry {
  return currentRegistry;
}

/**
 * Sets the registry.
 *
 * @param registry - Registry to use.
 */
export function logSetRegistry(registry: LogRegistry): void {
  currentRegistry = registry;
}

/**
 * Sets new registry.
 *
 * @returns The new registry.
 */
export function logNewRegistry(): LogRegistry {
  currentRegistry = new Map<LogKey, LogLevel>();
  return currentRegistry;
}

/**
 * Updates key with new level to current registry only if new level has lower priority than old level.
 *
 * @param key - The key.
 * @param newLevel - The new level.
 */
export function logUpdateKey(key: LogKey, newLevel: LogLevel): void {
  const registeredLevel = currentRegistry.get(key);
  if (registeredLevel === undefined) {
    currentRegistry.set(key, newLevel);
  } else {
    currentRegistry.set(key, Math.min(newLevel, registeredLevel));
  }
}

/**
 * Updates key/newLevel pairs to current registry. For each key, will update only if new levels has lower priority than old level.
 *
 * @param list - A list of key/newLevel pairs.
 */
export function logUpdateKeys(list: [LogKey, LogLevel][]): void {
  for (const [key, newLevel] of list) {
    logUpdateKey(key, newLevel);
  }
}

/**
 * Log data if key is enabled for level.
 *
 * @param key - The key.
 * @param level - The level.
 * @param data - The data to be logged.
 */
export function log(
  key: LogKey,
  level: LogLevel.Debug | LogLevel.Info | LogLevel.Warn | LogLevel.Error,
  ...data: unknown[]
) {
  const registeredLevel = currentRegistry.get(key);
  if (registeredLevel !== undefined && registeredLevel <= level) {
    const levelDisplay = logLevelDisplay[level];
    const keyDisplay = "description" in key ? key.description : key.name;
    console.log(`${levelDisplay}:`, `${keyDisplay}:`, ...data);
  }
}

/**
 * Log data if key is enabled for `Debug` level.
 *
 * @param key - The key.
 * @param data - The data to be logged.
 */
export function logDebug(key: LogKey, ...data: unknown[]): void {
  log(key, LogLevel.Debug, ...data);
}

/**
 * Log data if key is enabled for `Info` level.
 *
 * @param key - The key.
 * @param data - The data to be logged.
 */
export function logInfo(key: LogKey, ...data: unknown[]): void {
  log(key, LogLevel.Info, ...data);
}

/**
 * Log data if key is enabled for `Warn` level.
 *
 * @param key - The key.
 * @param data - The data to be logged.
 */
export function logWarn(key: LogKey, ...data: unknown[]): void {
  log(key, LogLevel.Warn, ...data);
}

/**
 * Log data if key is enabled for `Error` level.
 *
 * @param key - The key.
 * @param data - The data to be logged.
 */
export function logError(key: LogKey, ...data: unknown[]): void {
  log(key, LogLevel.Error, ...data);
}
