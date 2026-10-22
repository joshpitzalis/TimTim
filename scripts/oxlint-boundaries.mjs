import { isBuiltin } from "node:module";
import { dirname, resolve } from "node:path";

const browserVoidImports = new Set([
  "void/client", "void/client/react", "void/client/vue", "void/client/svelte", "void/client/solid",
  "void/sse/client", "void/live/client", "void/pages-client", "void/pages-prefetch",
  "@void/react", "@void/react/pages-client",
]);

export default {
  meta: { name: "strokes-boundaries" },
  rules: {
    "no-platform-in-domain": {
      meta: { type: "problem", schema: [], messages: { forbidden: "Keep domain code pure and browser/server dependencies in their owning modules." } },
      create(context) {
        const filename = context.filename;
        const domain = filename.includes("/domain/");
        const browser = filename.includes("/browser/");
        const page = filename.includes("/pages/") && !filename.endsWith(".server.ts");
        function check(node) {
          const source = node.source;
          if (!source) return;
          const name = source.value;
          if (typeof name !== "string") {
            if (domain || browser || page) context.report({ node, messageId: "forbidden" });
            return;
          }
          const target = name.startsWith(".") ? resolve(dirname(filename), name) : name;
          const provider = target.includes("/providers/") || target.includes("/routes/") || target.endsWith(".server") || target.endsWith(".server.ts");
          const platform = /^(?:node:|react(?:-dom)?(?:\/|$)|void(?:\/|$)|@void\/)/.test(name);
          const forbidden = domain
            ? provider || target.includes("/browser/") || target.includes("/pages/") || platform || (!name.startsWith(".") && name !== "effect" && !name.startsWith("effect/"))
            : (browser || page)
              ? provider || isBuiltin(name) || name.startsWith("node:") || ((name === "void" || name.startsWith("void/") || name.startsWith("@void/")) && !browserVoidImports.has(name))
              : (filename.includes("/routes/") || filename.includes("/providers/")) && target.includes("/browser/");
          if (forbidden) context.report({ node, messageId: "forbidden" });
        }
        return { ImportDeclaration: check, ExportNamedDeclaration: check, ExportAllDeclaration: check, ImportExpression: check };
      },
    },
  },
};
