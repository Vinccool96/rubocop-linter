#!/bin/sh -e

cd "${GITHUB_WORKSPACE}/${INPUT_WORKDIR}" || exit
export RUBOCOP_GITHUB_API_TOKEN="${INPUT_GITHUB_TOKEN}"

TEMP_PATH="$(mktemp -d)"
PATH="${TEMP_PATH}:$PATH"

if [ "${INPUT_SKIP_INSTALL}" = "false" ]; then
  echo '::group:: Installing rubocop with extensions ... https://github.com/rubocop/rubocop'
  # if 'gemfile' rubocop version selected
  if [ "${INPUT_RUBOCOP_VERSION}" = "gemfile" ]; then
    # if Gemfile.lock is here
    if [ -f 'Gemfile.lock' ]; then
      # grep for rubocop version
      RUBOCOP_GEMFILE_VERSION=$(ruby -ne 'print $& if /^\s{4}rubocop\s\(\K.*(?=\))/' Gemfile.lock)

      # if rubocop version found, then pass it to the gem install
      # left it empty otherwise, so no version will be passed
      if [ -n "$RUBOCOP_GEMFILE_VERSION" ]; then
        RUBOCOP_VERSION=$RUBOCOP_GEMFILE_VERSION
      else
        printf "Cannot get the rubocop's version from Gemfile.lock. The latest version will be installed."
      fi
    else
      printf 'Gemfile.lock not found. The latest version will be installed.'
    fi
  else
    # set desired rubocop version
    RUBOCOP_VERSION=$INPUT_RUBOCOP_VERSION
  fi

  gem install -N rubocop --version "${RUBOCOP_VERSION}"

  # Traverse over list of rubocop extensions
  for extension in $INPUT_RUBOCOP_EXTENSIONS; do
    # grep for name and version
    INPUT_RUBOCOP_EXTENSION_NAME=$(echo "$extension" | awk 'BEGIN { FS = ":" } ; { print $1 }')
    INPUT_RUBOCOP_EXTENSION_VERSION=$(echo "$extension" | awk 'BEGIN { FS = ":" } ; { print $2 }')

    # if version is 'gemfile'
    if [ "${INPUT_RUBOCOP_EXTENSION_VERSION}" = "gemfile" ]; then
      # if Gemfile.lock is here
      if [ -f 'Gemfile.lock' ]; then
        # grep for rubocop extension version
        RUBOCOP_EXTENSION_GEMFILE_VERSION=$(ruby -ne "print $& if /^\s{4}$INPUT_RUBOCOP_EXTENSION_NAME\s\(\K.*(?=\))/" Gemfile.lock)

        # if rubocop extension version found, then pass it to the gem install
        # left it empty otherwise, so no version will be passed
        if [ -n "$RUBOCOP_EXTENSION_GEMFILE_VERSION" ]; then
          RUBOCOP_EXTENSION_VERSION=$RUBOCOP_EXTENSION_GEMFILE_VERSION
        else
          printf "Cannot get the rubocop extension version from Gemfile.lock. The latest version will be installed."
        fi
      else
        printf 'Gemfile.lock not found. The latest version will be installed.'
      fi
    else
      # set desired rubocop extension version
      RUBOCOP_EXTENSION_VERSION=$INPUT_RUBOCOP_EXTENSION_VERSION
    fi

    # Handle extensions with no version qualifier
    if [ -z "${RUBOCOP_EXTENSION_VERSION}" ]; then
      unset RUBOCOP_EXTENSION_VERSION_FLAG
    else
      RUBOCOP_EXTENSION_VERSION_FLAG="--version ${RUBOCOP_EXTENSION_VERSION}"
    fi

    # shellcheck disable=SC2086
    gem install -N "${INPUT_RUBOCOP_EXTENSION_NAME}" ${RUBOCOP_EXTENSION_VERSION_FLAG}
  done
  echo '::endgroup::'
fi

export RUBOCOP_GITHUB_API_TOKEN="${INPUT_GITHUB_TOKEN}"

if [ "${INPUT_USE_BUNDLER}" = "false" ]; then
  BUNDLE_EXEC=""
else
  BUNDLE_EXEC="bundle exec "
fi

FILES_TO_LINT=$(git diff HEAD^ HEAD --name-only)
if [ "${INPUT_USE_BUNDLER}" = "false" ]; then
  FILES_TO_LINT=""
fi

echo '::group:: Running rubocop...'
# shellcheck disable=SC2086
rubocop_rc=0
${BUNDLE_EXEC}rubocop --autocorrect --fail-level ${INPUT_FAIL_LEVEL} ${INPUT_RUBOCOP_FLAGS} ${FILES_TO_LINT} || rubocop_rc=$?
if [ "${INPUT_FAIL_ON_ERROR}" = "false" ]; then
  rubocop_rc=0
fi
echo '::endgroup::'
exit $rubocop_rc
