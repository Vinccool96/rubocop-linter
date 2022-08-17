import { Diff, Repository } from "nodegit"

export async function getDiffFiles(baseDir: string, branch: string): Promise<string[]> {
  const files: Set<string> = new Set()
  const repo = await Repository.open(baseDir)
    .then((rep) => rep)
  const commit = await repo.getBranchCommit(branch)
    .then((c) => c)
  const diffs = await commit.getDiff()
    .then((ds) => ds)

  for (const diff of diffs) {
    for (let i = 0; i < diff.numDeltas(); i++) {
      const delta = diff.getDelta(i)
      if ([Diff.DELTA.ADDED, Diff.DELTA.MODIFIED, Diff.DELTA.RENAMED].includes(delta.status())){
        files.add(`${baseDir}/${delta.newFile().path()}`)
      }
    }
  }
  return Array.from(files)
}
