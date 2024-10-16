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
 * Returns display of level.
 *
 * @param level - The level.
 * @returns The display of level.
 */
export function logGetLevelDisplay(level: LogLevel): string {
  return logLevelDisplay[level];
}

/**
 * Keys are distinguished by reference. If both `description` and `name` properties are present, `description` will be used for logging.
 */
export type LogKey = { description: string } | { name: string };

/**
 * Registries map keys to levels.
 */
export type LogRegistry = Map<LogKey, LogLevel>;

let currentRegistry: LogRegistry = new Map<LogKey, LogLevel>();

/**
 * Returns registry.
 *
 * @returns The registry.
 */
export function logGetRegistry(): LogRegistry {
  return currentRegistry;
}

/**
 * Sets registry.
 *
 * @param registry - The registry.
 */
export function logSetRegistry(registry: LogRegistry): void {
  currentRegistry = registry;
}

/**
 * Sets a new registry.
 *
 * @returns The new registry.
 */
export function logNewRegistry(): LogRegistry {
  currentRegistry = new Map<LogKey, LogLevel>();

  return currentRegistry;
}

/**
 * Adds key with level to registry only if key does not exist.
 *
 * @param key - The key.
 * @param level - The level.
 * @returns If key was added.
 */
export function logAddKey(key: LogKey, level: LogLevel): boolean {
  if (currentRegistry.has(key)) {
    return false;
  } else {
    currentRegistry.set(key, level);
    return true;
  }
}

/**
 * Adds key/level pairs to registry. For each key, will add only if key does not exist.
 *
 * @param list - The list of key/level pairs.
 * @returns The tuple of added keys and not added keys.
 */
export function logAddKeys(list: [LogKey, LogLevel][]): [LogKey[], LogKey[]] {
  const addedKeys: LogKey[] = [];
  const notAddedKeys: LogKey[] = [];

  for (const [key, level] of list) {
    const isAdded = logAddKey(key, level);

    if (isAdded) {
      addedKeys.push(key);
    } else {
      notAddedKeys.push(key);
    }
  }

  return [addedKeys, notAddedKeys];
}

/**
 * Sets key with level to registry.
 *
 * @param key - The key.
 * @param level - The level.
 */
export function logSetKey(key: LogKey, level: LogLevel): void {
  currentRegistry.set(key, level);
}

/**
 * Sets key/level pairs to registry.
 *
 * @param list - A list of key/level pairs.
 */
export function logSetKeys(list: [LogKey, LogLevel][]): void {
  for (const [key, level] of list) {
    logSetKey(key, level);
  }
}

/**
 * Updates key with new level to registry only if new level has lower priority than old level.
 *
 * @param key - The key.
 * @param newLevel - The new level.
 */
export function logUpdateKey(key: LogKey, newLevel: LogLevel): boolean {
  const registeredLevel = currentRegistry.get(key);
  if (registeredLevel === undefined || newLevel < registeredLevel) {
    currentRegistry.set(key, newLevel);

    return true;
  } else {
    return false;
  }
}

/**
 * Updates key/newLevel pairs to registry. For each key, will update only if new levels have lower priority than old levels.
 *
 * @param list - The list of key/newLevel pairs.
 * @returns The tuple of updated keys and not updated keys.
 */
export function logUpdateKeys(list: [LogKey, LogLevel][]): [LogKey[], LogKey[]] {
  const updatedKeys: LogKey[] = [];
  const notUpdatedKeys: LogKey[] = [];

  for (const [key, newLevel] of list) {
    const isUpdated = logUpdateKey(key, newLevel);

    if (isUpdated) {
      updatedKeys.push(key);
    } else {
      notUpdatedKeys.push(key);
    }
  }

  return [updatedKeys, notUpdatedKeys];
}

let overrideLevel: LogLevel = LogLevel.Off;

/**
 * Log data only if either key is enabled for level or override is set.
 *
 * @param key - The key.
 * @param level - The level.
 * @param data - The data.
 */
export function log(
  key: LogKey,
  level: LogLevel.Debug | LogLevel.Info | LogLevel.Warn | LogLevel.Error,
  ...data: unknown[]
): void {
  const levelDisplay = logGetLevelDisplay(level);
  const keyDisplay = "description" in key ? key.description : key.name;

  const registeredLevel = currentRegistry.get(key);
  if (registeredLevel !== undefined && registeredLevel <= level) {
    console.log(`${levelDisplay}:`, `${keyDisplay}:`, ...data);
  } else if (overrideLevel <= level) {
    console.log("(Override):", `${levelDisplay}:`, `${keyDisplay}:`, ...data);
  }
}

/**
 * Log data only if key is enabled for `Debug` level.
 *
 * @param key - The key.
 * @param data - The data.
 */
export function logDebug(key: LogKey, ...data: unknown[]): void {
  log(key, LogLevel.Debug, ...data);
}

/**
 * Log data only if key is enabled for `Info` level.
 *
 * @param key - The key.
 * @param data - The data.
 */
export function logInfo(key: LogKey, ...data: unknown[]): void {
  log(key, LogLevel.Info, ...data);
}

/**
 * Log data only if key is enabled for `Warn` level.
 *
 * @param key - The key.
 * @param data - The data.
 */
export function logWarn(key: LogKey, ...data: unknown[]): void {
  log(key, LogLevel.Warn, ...data);
}

/**
 * Log data only if key is enabled for `Error` level.
 *
 * @param key - The key.
 * @param data - The data.
 */
export function logError(key: LogKey, ...data: unknown[]): void {
  log(key, LogLevel.Error, ...data);
}

/**
 * Gets override level.
 *
 * @returns The override level.
 */
export function logGetOverrideLevel(): LogLevel {
  return overrideLevel;
}

/**
 * Sets override level.
 *
 * @param level The override level.
 */
export function logSetOverrideLevel(level: LogLevel): void {
  overrideLevel = level;
}

/**
 * Executes callback with override level set.
 *
 * @param level - The level.
 * @param callback - The callback.
 */
export function logWrapOverride(level: LogLevel, callback: () => void): void {
  const currentOverrideLevel = overrideLevel;

  logSetOverrideLevel(level);

  callback();

  logSetOverrideLevel(currentOverrideLevel);
}
