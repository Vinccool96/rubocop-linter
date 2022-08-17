import fs from "fs"
import { exec } from "child_process"

import * as core from "@actions/core"
import { parse } from "yaml";

import { RubocopConfigYaml } from "./types";

export function promisifyExec(command: string): Promise<any> {
  return new Promise((resolve, reject) => exec(command, (error, stdout, _stderr) => {
    if (error) {
      if (error.code === 1) {
        // leaks present
        reject(stdout)
      } else {
        // gitleaks error
        reject(error);
      }
    } else {
      // no leaks
      resolve(stdout);
    }
  }))
}

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

export function getVersionFromGemfile(filePath: string, gem: string): string {
  let version = ""
  if (fs.existsSync(`${filePath}/Gemfile.lock`)) {
    fs.readFile(`${filePath}/Gemfile.lock`, "utf8", function (_err, data) {
      const matches = new RegExp(`(?<=^\s{4}${gem}\s\().*(?=\))`, "g")[Symbol.match](data)
      const gemfile_version = matches ? matches[0] : ""
      if (gemfile_version) {
        version = gemfile_version
      } else {
        core.info("Cannot get the rubocop extension version from Gemfile.lock. The latest version will be installed.")
      }
    })
  } else {
    core.info("Gemfile.lock not found. The latest version will be installed.")
  }
  return version
}

export function prefilterFiles(files: string[], baseDir: string): string[] {
  return baseDir !== "." ? files.filter((file) => new RegExp(`^${baseDir}/`, "g").test(file)) : files
}

export function filterFiles(files: string[], baseDir: string): string[] {
  let filteredFiles = files
  if (baseDir !== ".") {
    filteredFiles = filteredFiles.filter((file) => new RegExp(`^${baseDir}/`, "g").test(file))
  }

  if (fs.existsSync(`${baseDir}/.rubocop.yml`)) {
    const rubocopConfigFile = fs.readFileSync(`${baseDir}/.rubocop.yml`, "utf8")
    const config: RubocopConfigYaml = parse(rubocopConfigFile)
    const excluded = config.AllCops?.Exclude
    if (excluded) {
      const regexes = excludedRegexes(baseDir, excluded)
      return filteredFiles.filter((file) => regexes.some((regex) => regex.test(file)))
    }
  }
  return filteredFiles
}

function excludedRegexes(baseDir: string, patterns: string[]): RegExp[] {
  const base = baseDir === "." ? "" : `${baseDir}`
  return patterns.map((pattern) => new RegExp(`^${base}/${excludedPatternToRegexString(pattern)}$`))
}

function excludedPatternToRegexString(pattern: string): string {
  const realPattern = pattern.replace(".", "\\.")
  if (!realPattern.includes("*")) {
    return realPattern
  }
  const splitPattern = realPattern.split("/")
  let finalPattern = splitPattern[0]
  for (let i = 1; i < splitPattern.length; i++) {
    const patternPart = splitPattern[i]
    finalPattern += "/"
    if (patternPart === "**") {
      finalPattern += "(.+)/*"
    } else if (patternPart.includes("*")) {
      finalPattern += patternPart.replace("*", ".+")
    } else {
      finalPattern += patternPart
    }
  }
  return finalPattern
}

export function filesToString(files: string[]): string {
  let filesStr = ""
  for (const file of files) {
    filesStr += `"${file}" `
  }
  return filesStr.trim()
}
