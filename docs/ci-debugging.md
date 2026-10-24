# Debugging CI-only failures

## Reproduce before pushing

1. Identify the failing run, commit, test, and assertion. Inspect its log and retained Playwright trace from the `browser-results` artifact.
2. Reproduce the failing test in Linux with the command below. Observe the same failure before changing code. If it does not reproduce, compare the browser, architecture, dependencies, and test inputs with CI.
3. Change one suspected cause. Require the original assertion to pass in the reproducing environment; preserve coverage and keep retries disabled.
4. Run the affected suite, then the normal commit checks. Push the verified fix and watch the workflow for that exact commit.

## Linux browser tests

Start Docker and install local dependencies with `pnpm install --frozen-lockfile`, then run:

```sh
pnpm test:browser:linux mobile.spec.ts
pnpm test:browser:linux
```

The command forwards Playwright arguments, copies tracked files from the working tree (including uncommitted edits), and installs Linux dependencies in a disposable container. Stage new files with `git add` so they are included. Local dependencies and Git metadata stay outside the container. Test artifacts are saved in `test-results/linux/`; package downloads are cached in the Docker volume `timtim-linux-test-cache`. The first run downloads the image and Linux dependencies; later runs reuse those downloads.

The [official Playwright image](https://playwright.dev/docs/docker) matches the installed Playwright version. It uses the host's CPU architecture and the image's Node version, so it reproduces Linux browser behavior without promising an identical GitHub runner. For architecture-specific failures on Apple Silicon, compare against CI's x86 runner explicitly.

For mobile input failures, test the **first tap after drawing**. Rapid raw CDP touch injection previously caused Linux Chromium to consume that tap. The native gesture in `src/features/writing/__tests__/browser/mobile.spec.ts` covers drawing followed by one ordinary Retry tap. Check the gesture producer before changing application event handlers.

## Watch one run

Find the run for the pushed SHA with `gh run list --commit <sha>`, then use `gh run watch <run-id> --interval 30 --exit-status`. Report status transitions or new evidence; repeated pending results need no extra inspection. Confirm the run's SHA and conclusion before reporting CI success. Deployment and real-device verification are separate outcomes.

CI runs for pull requests and pushes to `main`. New commits cancel superseded runs for the same PR or branch.
