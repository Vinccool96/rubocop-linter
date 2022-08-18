import path from "path"
import { exec } from "child_process"

import * as core from "@actions/core"

import simpleGit from "simple-git"

import { debug, getInput } from "./io"
import {
  filesToString,
  filterFiles,
  getRubocopVersionFromGemfile,
  getVersionFromGemfile,
  prefilterFiles,
  promisifyExec,
} from "./util"
import { getDiffFiles } from "./git"

const baseDir = path.join(process.cwd(), getInput("workdir") || "")
debug(baseDir)
const git = simpleGit({ baseDir })

core.info(`Running in ${baseDir}`)

export async function execute() {
  process.chdir(baseDir)

  if (getInput("all_files", true)) {
    core.info("Running rubocop for all files")
    await processAllFiles()
  } else {
    core.info("Running rubocop for changed files")
    await processChangedFiles()
  }
}

async function processAllFiles() {
  if (!getInput("skip_install", true)) {
    processInstall()
  }

  await runRubocop()
}

async function processChangedFiles() {
  const branchesInfo = await git.branch()
  debug(branchesInfo, "branchesInfo")
  const currentCommit = branchesInfo.branches[branchesInfo.current].commit
  const unfilteredFiles = await getDiffFiles(branchesInfo.current, currentCommit)
    .then((unfiltered) => unfiltered)
  debug(unfilteredFiles, "unfilteredFiles")
  const files = prefilterFiles(unfilteredFiles, baseDir)
  debug(files, "files")
  const filteredFiles = filterFiles(files, baseDir)
  debug(filteredFiles, "filteredFiles")

  if (files.length) {
    if (!getInput("skip_install", true)) {
      processInstall()
    }

    const filesString = filesToString(filteredFiles)
    await runRubocop(filesString)
  } else {
    core.info("No file in the working directory has been modified. No need to run Rubocop.")
  }
}

async function runRubocop(files = "") {
  const bundleExec = getInput("use_bundler", true) ? "bundle exec " : ""
  core.startGroup("Running rubocop...")
  const fails = await promisifyExec(`${bundleExec}rubocop --autocorrect --fail-level ${getInput("fail_level")} ${getInput("rubocop_flags")} ${files}`)
    .then(() => true)
    .catch(() => getInput("fail_on_error", true))
  core.endGroup()
  if (fails) {
    core.setFailed("Rubocop is set to fail on error")
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
