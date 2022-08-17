import path from "path"
import { exec } from "child_process"

import * as core from "@actions/core"

import simpleGit from "simple-git"

import { getInput } from "./io"
import {
  filesToString,
  filterFiles,
  getRubocopVersionFromGemfile,
  getVersionFromGemfile,
  prefilterFiles,
  promisifyExec,
} from "./util"

const baseDir = path.join(process.cwd(), getInput("workdir") || "")
const git = simpleGit({ baseDir })

core.info(`Running in ${baseDir}`)

export async function execute() {
  const branchesInfo = await git.branch()
  core.debug(JSON.stringify(branchesInfo, null, 2))
  const currentBranch = branchesInfo.branches[branchesInfo.current]
  const currentCommit = currentBranch.commit
  const diff = await git.diff([`${currentCommit}`, currentCommit, "--name-only"])
  const files = prefilterFiles(diff.split("\n").filter((file) => file), baseDir)
  if (files.length) {
    await exec(`cd ${baseDir}`)
    if (!getInput("skip_install", true)) {
      processInstall()
    }

  const bundleExec = getInput("use_bundler", true) ? "bundle exec " : ""
    const filesString = !getInput("all_files", true) ? "" : filesToString(filterFiles(files, baseDir))

    core.startGroup("Running rubocop...")
    const fails = await promisifyExec(`${bundleExec}rubocop --autocorrect --fail-level ${getInput("fail_level")} ${getInput("rubocop_flags")} ${filesString}`)
      .then(() => true)
      .catch(() => getInput("fail_on_error", true))
    core.endGroup()
    if (fails) {
      core.setFailed("Rubocop is set to fail on error")
    }
  } else {
    core.info("No file in the working directory has been modified. No need to run Rubocop.")
  }
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
