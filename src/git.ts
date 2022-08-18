import { Octokit } from "octokit"
import { debug, getInput } from "./io"

const octokit = new Octokit({ auth: getInput("github_token") })

export async function getDiffFiles(commit: string): Promise<string[]> {
  const gitWorkspace = process.env.GITHUB_WORKSPACE!
  debug(gitWorkspace, "gitWorkspace")
  const fullRepo = process.env.GITHUB_ACTION_REPOSITORY!.split("/")
  debug(fullRepo, "fullRepo")
  const owner = fullRepo[0]
  debug(owner, "owner")
  const repo = fullRepo[1]
  debug(repo, "repo")
  const files: Set<string> = new Set()
  const commitData = (await octokit.rest.repos.getCommit({ owner, repo, ref: commit }).then((c) => c)).data
  debug(commitData, "commitData")
  for (const file of commitData.files!) {
    debug(file, "file")
    if (file.status !== "removed") {
      files.add(`${gitWorkspace}/${file.filename}`)
    }
  }
  debug(files, "files")
  return Array.from(files)
}
