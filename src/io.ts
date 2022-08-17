import * as core from "@actions/core"

import { input, InputTypes } from "./types"

export function getInput<T extends input>(name: T, parseAsBool: true): boolean
export function getInput<T extends input>(
  name: T,
  parseAsBool?: false
): InputTypes[T]
export function getInput<T extends input>(
  name: T,
  parseAsBool = false
): InputTypes[T] | boolean {
  if (parseAsBool) {
    return core.getBooleanInput(name)
  }

  // @ts-ignore
  return core.getInput(name)
}

function setInput(input: input, value: string | undefined) {
  if (value) {
    return (process.env[`INPUT_${input.toUpperCase()}`] = value)
  } else {
    return delete process.env[`INPUT_${input.toUpperCase()}`]
  }
}

function setDefault(input: input, value: string) {
  if (!getInput(input)) {
    setInput(input, value)
  }
  return getInput(input)
}
