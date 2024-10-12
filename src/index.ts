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

export type LogKey = { name: string } | { description: string };

export type LogRegistry = Map<LogKey, LogLevel>;

let currentRegistry: LogRegistry = new Map<LogKey, LogLevel>();

export function logGetRegistry(): LogRegistry {
  return currentRegistry;
}

export function logSetRegistry(registry: LogRegistry): void {
  currentRegistry = registry;
}

export function logNewRegistry(): LogRegistry {
  currentRegistry = new Map<LogKey, LogLevel>();
  return currentRegistry;
}

export function logAddKey(key: LogKey, level: LogLevel): void {
  const registeredLevel = currentRegistry.get(key);
  if (registeredLevel === undefined) {
    currentRegistry.set(key, level);
  } else {
    currentRegistry.set(key, Math.min(level, registeredLevel));
  }
}

export function logAddKeys(list: [LogKey, LogLevel][]): void {
  for (const [key, level] of list) {
    logAddKey(key, level);
  }
}

export function log(
  key: LogKey,
  level: LogLevel.Debug | LogLevel.Info | LogLevel.Warn | LogLevel.Error,
  ...data: any[]
) {
  const registeredLevel = currentRegistry.get(key);
  if (registeredLevel !== undefined && registeredLevel <= level) {
    const levelDisplay = logLevelDisplay[level];
    const keyDisplay = "description" in key ? key.description : key.name;
    console.log(`${levelDisplay}:`, `${keyDisplay}:`, ...data);
  }
}
