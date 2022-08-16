import * as core from "@actions/core"

interface InputTypes {
  rubocop_version: string
  rubocop_extensions: string | undefined
  rubocop_flags: string | undefined
  fail_level: "info" | "refactor" | "convention" | "warning" | "error" | "fatal"
  fail_on_error: "false" | "true"
  workdir: string
  skip_install: "false" | "true"
  use_bundler: "false" | "true"
  all_files: "false" | "true"

  github_token: string | undefined
}

export type input = keyof InputTypes

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
