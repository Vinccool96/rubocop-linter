# GitHub Action: Run rubocop-linter

[![](https://img.shields.io/github/license/Vinccool96/rubocop-linter)](./LICENSE)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/Vinccool96/rubocop-linter?logo=github&sort=semver)](https://github.com/Vinccool96/rubocop-linter/releases)
[![action-bumpr supported](https://img.shields.io/badge/bumpr-supported-ff69b4?logo=github&link=https://github.com/haya14busa/action-bumpr)](https://github.com/haya14busa/action-bumpr)

This action runs [rubocop](https://github.com/rubocop/rubocop) with its
[auto-correct](https://docs.rubocop.org/rubocop/usage/auto_correct.html) mode.

## Usage

You can create [RuboCop Configuration](https://docs.rubocop.org/rubocop/configuration.html) and this action uses that
config too.

```yml
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  rubocop:
    name: Run rubocop-linter
    runs-on: ubuntu-latest
    steps:
      - name: Checkout (pull request)
        if: github.event_name == 'pull_request'
        uses: actions/checkout@v2
        with:
          ref: ${{ github.event.pull_request.head.ref }}
      - name: Checkout (push)
        if: github.event_name != 'pull_request'
        uses: actions/checkout@v2
      - uses: ruby/setup-ruby@v1.101.0
      - name: Run rubocop
        uses: Vinccool96/rubocop-linter@v1
      - name: Add & Commit
        uses: EndBug/add-and-commit@v9.0.0
        with:
          message: 'rubocop-linter commit'
```

## Inputs

### `github_token`

`GITHUB_TOKEN`. Default is `${{ github.token }}`.

**If you use the default value, make sure the
[repository's](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#setting-the-permissions-of-the-github_token-for-your-repository)
or
the [organisation's](https://docs.github.com/en/organizations/managing-organization-settings/disabling-or-limiting-github-actions-for-your-organization#setting-the-permissions-of-the-github_token-for-your-organization)
have the `Read and write permissions` enabled.**

### `rubocop_version`

Optional. Set rubocop version. Possible values:

* empty or omit: install latest version
* `gemfile`: install version from Gemfile (`Gemfile.lock` should be presented, otherwise it will fallback to latest
  bundler version)
* version (e.g. `0.90.0`): install said version

### `rubocop_extensions`

Optional. Set list of rubocop extensions with versions.

Provide desired version delimited by `:` (e.g. `rubocop-rails:1.7.1`)

Possible version values:

* empty or omit (`rubocop-rails rubocop-rspec`): install latest version
* `rubocop-rails:gemfile rubocop-rspec:gemfile`: install version from Gemfile (`Gemfile.lock` should be presented,
  otherwise it will fallback to latest bundler version)
* version (e.g. `rubocop-rails:1.7.1 rubocop-rspec:2.0.0`): install said version

You can combine `gemfile`, fixed and latest bundle version as you want to.

### `rubocop_flags`

Optional. Rubocop flags. (rubocop `<rubocop_flags>`).

### `fail_level`

Optional. The
[`--fail-level` command-line flag](https://docs.rubocop.org/rubocop/usage/basic_usage.html#command-line-flags) of the
rubocop inspection. Default is `error`.

Since the command of the action does `rubocop [...] --fail-level ${fail_level}`, you can put here whatever you want that
you normally would.

**Note: if you don't set [the `fail_on_error` option](#fail_on_error), this option will have no effect whatsoever on the
action.**

### `fail_on_error`

Optional. Exit code for rubocop-linter when errors are found [`true`, `false`].
Default is `false`.

### `skip_install`

Optional. Do not install Rubocop or its extensions. Default: `false`.

### `use_bundler`

Optional. Run Rubocop with bundle exec. Default: `false`.
