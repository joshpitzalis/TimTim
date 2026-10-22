import { strict as assert } from "node:assert";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

test("the fence rejects invalid types, floating Effects and cross-boundary imports", () => {
  const directory = mkdtempSync(join(process.cwd(), ".fence-fixtures-"));
  const probe = join(directory, "domain", "probe.ts");
  mkdirSync(join(directory, "domain"));
  mkdirSync(join(directory, "browser"));
  writeFileSync(join(directory, "browser", "adapter.ts"), "export const adapter = 1;\n");
  writeFileSync(join(directory, "tsconfig.json"), JSON.stringify({ extends: "../tsconfig.json", include: ["domain/probe.ts"], exclude: [] }));
  const compile = () => spawnSync("./node_modules/.bin/tsc", ["--noEmit", "--project", join(directory, "tsconfig.json")], { encoding: "utf8" });
  const lint = () => spawnSync("./node_modules/.bin/oxlint", ["--deny-warnings", probe], { encoding: "utf8" });
  try {
    writeFileSync(probe, 'export const points: number = "broken";\n');
    let result = compile();
    assert.notEqual(result.status, 0, "ordinary type violations must fail");
    assert.match(result.stdout + result.stderr, /not assignable/);
    writeFileSync(probe, 'import { Effect } from "effect";\nEffect.succeed(1);\n');
    result = compile();
    assert.notEqual(result.status, 0, "Effect diagnostics must fail the compiler");
    assert.match(result.stdout + result.stderr, /floatingEffect/);
    for (const source of [
      'import { adapter } from "../browser/adapter"; export const value = adapter;',
      'export { adapter } from "../browser/adapter";',
      'export const adapter = import("../browser/adapter");',
      'import { readFile } from "node:fs"; export const adapter = readFile;',
    ]) {
      writeFileSync(probe, source);
      result = lint();
      assert.notEqual(result.status, 0, "domain platform imports must fail");
      assert.match(result.stdout + result.stderr, /no-platform-in-domain/);
    }
    for (const source of ["export const platform = window;", "export const platform = document;"]) {
      writeFileSync(probe, source);
      result = lint();
      assert.notEqual(result.status, 0, "domain browser globals must fail");
      assert.match(result.stdout + result.stderr, /no-restricted-globals/);
    }
    mkdirSync(join(directory, "pages"));
    for (const folder of ["browser", "pages"]) {
      const browserProbe = join(directory, folder, "probe.ts");
      for (const name of ["void", "fs", "fs/promises", "path", "child_process", "node:fs", "void/handler", "void/kv", "void/storage", "@void/react/pages-server", "@void/react/plugin"]) {
        writeFileSync(browserProbe, `import * as dependency from "${name}"; export const value = dependency;`);
        result = spawnSync("./node_modules/.bin/oxlint", ["--deny-warnings", browserProbe], { encoding: "utf8" });
        assert.notEqual(result.status, 0, `${folder} server import ${name} must fail`);
        assert.match(result.stdout + result.stderr, /no-platform-in-domain/);
      }
      for (const name of ["react", "@void/react", "@void/react/pages-client", "void/client", "void/client/react", "void/sse/client", "void/live/client", "void/pages-client", "void/pages-prefetch"]) {
        writeFileSync(browserProbe, `import * as dependency from "${name}"; export const value = dependency;`);
        result = spawnSync("./node_modules/.bin/oxlint", ["--deny-warnings", browserProbe], { encoding: "utf8" });
        assert.equal(result.status, 0, `${folder} browser import ${name} must pass: ${result.stdout}${result.stderr}`);
      }
    }
    writeFileSync(probe, 'import { Effect } from "effect"; export const value = Effect.succeed(1);');
    result = lint();
    assert.equal(result.status, 0, result.stdout + result.stderr);
    writeFileSync(probe, "export const points: number = 3;\n");
    execFileSync("./node_modules/.bin/tsc", ["--noEmit", "--project", join(directory, "tsconfig.json")]);
    result = lint();
    assert.equal(result.status, 0, result.stdout + result.stderr);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
