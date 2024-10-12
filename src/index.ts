export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  Off = 4,
}

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
