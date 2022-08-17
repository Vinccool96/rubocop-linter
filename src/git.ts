import nodegit from "nodegit"

import { debug } from "./io"

export async function getDiffFiles(baseDir: string, branch: string): Promise<string[]> {
  const files: Set<string> = new Set()
  const repo = await nodegit.Repository.open(baseDir)
    .then((rep) => rep)
  debug(repo, "repo")
  const commit = await repo.getBranchCommit(branch)
    .then((c) => c)
  debug(commit, "commit")
  const diffs = await commit.getDiff()
    .then((ds) => ds)
  debug(diffs, "diffs")

  for (const diff of diffs) {
    debug(diff, "diff")
    debug(diff.numDeltas(), "diff.numDeltas()")
    for (let i = 0; i < diff.numDeltas(); i++) {
      const delta = diff.getDelta(i)
      debug(diffs, "diffs")
      if ([nodegit.Diff.DELTA.ADDED, nodegit.Diff.DELTA.MODIFIED, nodegit.Diff.DELTA.RENAMED].includes(delta.status())){
        files.add(`${baseDir}/${delta.newFile().path()}`)
      }
    }
  }
  debug(files, "files")
  return Array.from(files)
}
