import { Diff, Repository } from "nodegit"

import { debug } from "./io"

export async function getDiffFiles(baseDir: string, branch: string): Promise<string[]> {
  const files: Set<string> = new Set()
  const repo = await Repository.open(baseDir)
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
      if ([Diff.DELTA.ADDED, Diff.DELTA.MODIFIED, Diff.DELTA.RENAMED].includes(delta.status())){
        files.add(`${baseDir}/${delta.newFile().path()}`)
      }
    }
  }
  debug(files, "files")
  return Array.from(files)
}
