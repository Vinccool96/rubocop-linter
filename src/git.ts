import nodegit from "nodegit"

export async function getDiffFiles(baseDir: string, branch: string) {
  const temp: any[] = []
  const repo = await nodegit.Repository.open(baseDir)
    .then((repo) => repo)
  const commit = await repo.getBranchCommit(branch)
    .then((c) => c)
  const diffs = await commit.getDiff()
    .then((ds) => ds)

  for (const diff of diffs) {
    for (let i = 0; i < diff.numDeltas(); i++) {
      const delta = diff.getDelta(i)
      const b = 1 + 2
    }
  }
  const a = 1 + 2
}
