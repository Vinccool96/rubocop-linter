export interface InputTypes {
  rubocop_version: string
  rubocop_extensions: string
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

export interface GitEnvTypes {
  ref_name: string
  ref_type: string
  head_ref: string | undefined
}

export type gitEnv = keyof GitEnvTypes

export interface AllCopsType {
  Exclude?: string[]
  [key: string]: any
}

export interface RubocopConfigYaml {
  AllCops?: AllCopsType
  [key: string]: any
}
