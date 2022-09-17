import { Octokit } from "octokit"
import { debug, getInput, getGitEnv } from "./io"

const octokit = new Octokit({ auth: getInput("github_token") })

const gitWorkspace = process.env.GITHUB_WORKSPACE!
debug(gitWorkspace, "gitWorkspace")

export async function getDiffFiles(
  branch: string,
  commit: string
): Promise<string[]> {
  debug(getGitEnv("repository"), 'getGitEnv("repository")')
  debug(getGitEnv("ref_name"), 'getGitEnv("ref_name")')
  debug(getGitEnv("ref_type"), 'getGitEnv("ref_type")')
  debug(getGitEnv("head_ref"), 'getGitEnv("head_ref")')
  const fullRepo = getGitEnv("repository").split("/")
  debug(fullRepo, "fullRepo")
  const owner = fullRepo[0]
  debug(owner, "owner")
  const repo = fullRepo[1]
  debug(repo, "repo")
  const files: Set<string> = new Set()
  const branchResp = await octokit.rest.repos
    .getBranch({ owner, repo, branch })
    .then((b) => b)
  debug(branchResp, "branchResp")
  const commitData = (
    await octokit.rest.repos
      .getCommit({ owner, repo, ref: commit })
      .then((c) => c)
  ).data
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

async function filesCrawler(
  owner: string,
  repo: string,
  ref: string,
  path = ""
): Promise<string[]> {
  const files: string[] = []
  const content = (
    await octokit.rest.repos
      .getContent({ owner, repo, path, ref })
      .then((c) => c)
  ).data
  if (Array.isArray(content)) {
    for (const contentElement of content) {
      if (contentElement.type == "dir") {
        files.push(
          ...(await filesCrawler(owner, repo, ref, contentElement.path))
        )
      }
    }
  }
  return files
}

export async function getAllFiles(commit = "737d4e2"): Promise<string[]> {
  const files: string[] = []

  const fullRepo = ["Vinccool96", "lint-test"]
  debug(fullRepo, "fullRepo")
  const owner = fullRepo[0]
  debug(owner, "owner")
  const repo = fullRepo[1]
  debug(repo, "repo")
  const content = await filesCrawler(owner, repo, commit).then((c) => c)
  return files
}
