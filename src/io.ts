import * as core from "@actions/core"
import { ExecOptions } from "@actions/exec"

import { input, InputTypes, gitEnv, GitEnvTypes } from "./types"

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

export function getGitEnv<T extends gitEnv>(name: T): GitEnvTypes[T] {
  // @ts-ignore
  return process.env[`GITHUB_${name.toUpperCase()}`]
}

export function debug(elem: any, name: string | null = null) {
  core.debug((name ? `${name}: ` : "") + JSON.stringify(elem, null, 2))
}

export const execOptions: ExecOptions = {
  listeners: {
    stdout(data: Buffer) {
      core.info(data.toString())
    },
    stderr(data: Buffer) {
      core.error(data.toString())
    },
  },
}
