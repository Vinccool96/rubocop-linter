import * as core from "@actions/core"
import fs from "fs"

export function getRubocopVersionFromGemfile(filePath: string): string {
  let version = ""
  if (fs.existsSync(`${filePath}/Gemfile.lock`)) {
    fs.readFile(`${filePath}/Gemfile.lock`, "utf8", function (_err, data) {
      const matches = /(?<=^\s{4}rubocop\s\().*(?=\))/[Symbol.match](data)
      const gemfile_version = matches ? matches[0] : ""
      if (gemfile_version) {
        version = gemfile_version
      } else {
        core.info("Cannot get the rubocop's version from Gemfile.lock. The latest version will be installed.")
      }
    })
  } else {
    core.info("Gemfile.lock not found. The latest version will be installed.")
  }
  return version
}
