import { Octokit } from "octokit"
import { debug, getInput, getGitEnv } from "./io"

const octokit = new Octokit({ auth: getInput("github_token") })

export async function getDiffFiles(branch: string, commit: string): Promise<string[]> {
  debug(getGitEnv("repository"), "getGitEnv(\"repository\")")
  debug(getGitEnv("ref_name"), "getGitEnv(\"ref_name\")")
  debug(getGitEnv("ref_type"), "getGitEnv(\"ref_type\")")
  debug(getGitEnv("head_ref"), "getGitEnv(\"head_ref\")")
  const gitWorkspace = process.env.GITHUB_WORKSPACE!
  debug(gitWorkspace, "gitWorkspace")
  const fullRepo = getGitEnv("repository").split("/")
  debug(fullRepo, "fullRepo")
  const owner = fullRepo[0]
  debug(owner, "owner")
  const repo = fullRepo[1]
  debug(repo, "repo")
  const files: Set<string> = new Set()
  const branchResp = await octokit.rest.repos.getBranch({ owner, repo, branch }).then((b) => b)
  debug(branchResp, "branchResp")
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
