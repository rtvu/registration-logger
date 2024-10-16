# REGISTRATION-LOGGER

A registration style logger written in Typescript.

## Installation

To install run:

```bash
npm install @rtvu/registration-logger
```

## Concepts

Designed for easy debug logging.

`LogKey`s are the central control structure. All logging requires a key as an argument. Logging at a priority level is enabled when provided key has already been registed with a permitted level. The key registration and permitted level can be bypassed by using the override.

`LogKey`s are objects with either a `description` or `name` string property. `name` property allows using functions as keys.

## Basic Usage

```typescript
import { logAddKey, logInfo, LogLevel} from `@rtvu/registration-logger`

key = { description: "key" }
logAddKey(key, LogLevel.Info)

logInfo(key, "Hello World!") // > "Info: key: Hello World!"
```

## Usage in a Module

```typescript
import { logAddKeys, logUpdateKeys, logInfo, LogLevel} from `@rtvu/registration-logger`

// Specify level for each function
logAddKeys([
  [foo, LogLevel.Off],
  [bar, LogLevel.Debug],
])

// Overrides function level if module has lower priority
const moduleLogLevel = LogLevel.Off
if (moduleLogLevel !== LogLevel.Off) {
  logUpdateKeys([
    [foo, moduleLogLevel],
    [bar, moduleLogLevel],
  ])
}

export function foo() {
  logInfo(foo, "foo") // Logging disabled
}

export function bar() {
  logInfo(bar, "bar") // Logging enabled at `Debug` priority
}
```

## Usage With Override

```typescript
import { logInfo, logSetOverrideLevel, LogLevel} from `@rtvu/registration-logger`

export function foo() {
  logInfo(foo, "foo")
}

foo() // Logging disabled, key is not registered

logSetOverrideLevel(LogLevel.Info)

foo() // > "(Override): Info: foo: foo"

logSetOverrideLevel(LogLevel.Off)

foo() // Logging disabled, key is not registered

```
