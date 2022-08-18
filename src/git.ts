import { Octokit } from "octokit"
import { debug, getInput } from "./io"

const octokit = new Octokit({ auth: getInput("github_token") })

export async function getDiffFiles(commit: string): Promise<string[]> {
  const gitWorkspace = process.env.GITHUB_WORKSPACE!
  const fullRepo = process.env.GITHUB_ACTION_REPOSITORY!.split("/")
  const owner = fullRepo[0]
  const repo = fullRepo[1]
  const files: Set<string> = new Set()
  const commitData = (await octokit.rest.repos.getCommit({ owner, repo, ref: commit }).then((c) => c)).data
  for (const file of commitData.files!) {
    if (file.status !== "removed") {
      files.add(`${gitWorkspace}/${file.filename}`)
    }
  }
  debug(files, "files")
  return Array.from(files)
}
