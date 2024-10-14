# REGISTRATION-LOGGER

A registration style logger written in Typescript.

## Installation

To install run:

```bash
npm install @rtvu/registration-logger
```

## Concepts

`LogKey`s are registered with a `LogLevel`. Logging is enabled when using a `LogKey` for an allowed `LogLevel`.

`LogKey`s are objects with either a `description` or `name` string property. `name` property allows using functions as keys.

## Basic Usage

```typescript
import { logAddKey, logInfo, LogLevel} from `@rtvu/registration-logger`

key = { description: "key" }
logAddKey(key, LogLevel.Info)

logInfo(key, "Hello World!")

// "Info: key: Hello World!"
```

## Usage in a Module

```typescript
import { logAddKeys, logUpdateKeys, logInfo, LogLevel} from `@rtvu/registration-logger`

// Specify level for each function
logAddKeys([
  [foo, LogLevel.Off],
  [bar, LogLevel.Off],
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
  logInfo(foo, "foo")
}

export function bar() {
  logInfo(bar, "bar")
}
```
