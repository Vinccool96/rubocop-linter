import { Octokit } from "octokit"
import { debug, getInput } from "./io"

const octokit = new Octokit({ auth: getInput("github_token")})

export async function getDiffFiles(baseDir: string, branch: string): Promise<string[]> {
  debug(process.env.GITHUB_ACTION_REPOSITORY, "process.env.GITHUB_ACTION_REPOSITORY")
  const files: Set<string> = new Set()
  debug(files, "files")
  return Array.from(files)
}
