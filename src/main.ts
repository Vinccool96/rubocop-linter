import path from "path"
import { exec } from "@actions/exec"

import * as core from "@actions/core"

import simpleGit from "simple-git"

import { BranchSummary } from "simple-git/dist/typings/response"

import { debug, execOptions, getInput } from "./io"
import {
  filesToString,
  filterFiles,
  getRubocopVersionFromGemfile,
  getVersionFromGemfile,
  prefilterFiles,
} from "./util"
import { getAllFiles, getDiffFiles } from "./git"

const baseDir = path.join(process.cwd(), getInput("workdir") || "")
debug(baseDir)
const git = simpleGit({ baseDir })

core.info(`Running in ${baseDir}`)

export async function execute(): Promise<void> {
  process.chdir(baseDir)

  if (getInput("all_files", true)) {
    core.info("Running rubocop for all files")
    await processAllFiles()
  } else {
    core.info("Running rubocop for changed files")
    await processChangedFiles()
  }
}

async function getSummary(): Promise<BranchSummary> {
  const branchesInfo = await git.branch()
  debug(branchesInfo, "branchesInfo")
  return branchesInfo
}

async function processAllFiles() {
  const branchesInfo = await getSummary()
  const unfilteredFiles = await getAllFiles(branchesInfo.branches[branchesInfo.current].commit)
  debug(unfilteredFiles, "unfilteredFiles")

  await processFiles(unfilteredFiles)
}

async function processChangedFiles() {
  const branchesInfo = await getSummary()
  const currentCommit = branchesInfo.branches[branchesInfo.current].commit
  const unfilteredFiles = await getDiffFiles(branchesInfo.current, currentCommit)
    .then((unfiltered) => unfiltered)
  debug(unfilteredFiles, "unfilteredFiles")

  await processFiles(unfilteredFiles)
}

async function processFiles(unfilteredFiles: string[]) {
  const files = prefilterFiles(unfilteredFiles, baseDir)
  debug(files, "files")
  const filteredFiles = filterFiles(files, baseDir)
  debug(filteredFiles, "filteredFiles")

  if (filteredFiles.length) {
    if (!getInput("skip_install", true)) {
      await processInstall()
    }

    const splitFiles: string[][] = []
    const chunkSize = 20
    for (let i = 0; i < filteredFiles.length; i += chunkSize) {
      splitFiles.push(filteredFiles.slice(i, i + chunkSize))
    }

    core.info(`Since there is ${filteredFiles.length}, rubocop will run ${Math.ceil(filteredFiles.length / chunkSize)}, so that each run has ${chunkSize} files max`)

    for (let i = 0; i < splitFiles.length; i++) {
      const split = splitFiles[i];

      core.info(`Run ${i + 1}/${Math.ceil(filteredFiles.length / chunkSize)}`)
      const filesString = filesToString(split)
      await runRubocop(filesString)
    }
  } else {
    core.info("No file in the working directory has been modified. No need to run Rubocop.")
  }
}

async function runRubocop(files = "") {
  core.startGroup("Running rubocop...")
  const bundleExec = getInput("use_bundler", true) ? "bundle exec " : ""
  const fails = await exec(`${bundleExec}rubocop --auto-correct --fail-level ${getInput("fail_level")} ${getInput("rubocop_flags")} ${files}`, undefined, execOptions)
  core.endGroup()
  if (fails) {
    core.setFailed("Rubocop is set to fail on error")
  }
}

async function processInstall() {
  core.startGroup("Installing rubocop with extensions ... https://github.com/rubocop/rubocop")
  let rubocopVersion: string
  if (getInput("rubocop_version") === "gemfile") {
    rubocopVersion = getRubocopVersionFromGemfile(baseDir)
  } else {
    rubocopVersion = getInput("rubocop_version")
  }
  const versionFlag = rubocopVersion ? `--version "${rubocopVersion}"` : ""
  await exec(`gem install -N rubocop ${versionFlag}`, undefined, execOptions)

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
    await exec(`gem install -N "${extensionName}" ${extensionFlag}`, undefined, execOptions)
  }
  core.endGroup()
}
