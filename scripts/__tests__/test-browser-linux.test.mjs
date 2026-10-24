import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

test("Linux runner preserves filters, omits Mac metadata, and propagates Docker failure", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "timtim-linux-runner-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(join(directory, "docker"), `#!/bin/sh
if [ "$1" = info ]; then exit 0; fi
cat > "$LINUX_RUNNER_TEST_DIR/source.tar"
printf '%s\\n' "$@" > "$LINUX_RUNNER_TEST_DIR/arguments"
exit 17
`, { mode: 0o755 });

  const result = spawnSync("bash", ["scripts/test-browser-linux.sh", "mobile.spec.ts", "--grep", "first tap"], {
    env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, LINUX_RUNNER_TEST_DIR: directory },
    encoding: "utf8",
  });
  assert.equal(result.status, 17, result.stderr);
  const args = readFileSync(join(directory, "arguments"), "utf8").trimEnd().split("\n");
  assert.deepEqual(args.slice(-3), ["mobile.spec.ts", "--grep", "first tap"]);
  const archive = spawnSync("tar", ["-tf", join(directory, "source.tar")], { encoding: "utf8" });
  assert.equal(archive.status, 0, archive.stderr);
  assert.match(archive.stdout, /^package\.json$/m);
  assert.doesNotMatch(archive.stdout, /(^|\/)\._/m);
});
