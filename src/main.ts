import * as core from "@actions/core"
import { exec } from "child_process"

import path from "path"
import simpleGit, { Response } from "simple-git"

import { getInput } from "./io"
import { getRubocopVersionFromGemfile, getVersionFromGemfile } from "./util"

const baseDir = path.join(process.cwd(), getInput("workdir") || "")
const git = simpleGit({ baseDir })

core.info(`Running in ${baseDir}`)

export async function execute() {
  if (!getInput("skip_install", true)) {
    processInstall()
  }

  const diff = await git.diff(["HEAD^", "HEAD", "--name-only"])
  const files = diff.split("\n").filter((file) => file)
}

function processInstall() {
  core.startGroup("Installing rubocop with extensions ... https://github.com/rubocop/rubocop")
  let rubocopVersion: string
  if (getInput("rubocop_version") === "gemfile") {
    rubocopVersion = getRubocopVersionFromGemfile(baseDir)
  } else {
    rubocopVersion = getInput("rubocop_version")
  }
  exec(`gem install -N rubocop --version "${rubocopVersion}"`)

  const extensions = getInput("rubocop_extensions").split(" ").filter((s) => s)
  for (const extension of extensions) {
    const split = extension.split(":")
    const extensionName = split[0]
    const inputExtensionVersion = split[1]
    let extensionVersion = ""
    if (inputExtensionVersion === "gemfile") {
      extensionVersion = getVersionFromGemfile(baseDir, extensionName)
    }
    const extensionFlag = extensionVersion ? `--version ${extensionVersion}` : ""
    exec(`gem install -N "${extensionName}" ${extensionFlag}`)
  }
  core.endGroup()
}
