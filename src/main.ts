import * as core from "@actions/core"
import path from "path"
import simpleGit, { Response } from "simple-git"
import { getInput } from "./io"

const baseDir = path.join(process.cwd(), getInput("workdir") || "")
const git = simpleGit({ baseDir })

core.info(`Running in ${baseDir}`)

export async function execute() {
  if (!getInput("skip_install", true)) {
    core.startGroup("Installing rubocop with extensions ... https://github.com/rubocop/rubocop")
    core.endGroup()
  }
  const currentBranch = await git.branch()
  const diff = await git.diff(["HEAD^", "HEAD", "--name-only"])
  const files = diff.split("\n").filter((file) => file)
  const a = 1 + 2
}
