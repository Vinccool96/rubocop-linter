import fs from "fs"

export function getRubocopVersionFromGemfile(filePath: string): string | undefined {
  if (fs.existsSync(`${filePath}/Gemfile.lock`)) {
    fs.readFile(`${filePath}/Gemfile.lock`, "utf8", function (_err, data) {
      const matches = /^\s{4}rubocop\s\(?<.*(?=\))/[Symbol.match](data)
    })
  }
  return undefined
}
