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

export function debug(elem: any, name: string | null = null) {
  core.debug((name ? `${name}: ` : "") + JSON.stringify(elem, null, 2))
}
