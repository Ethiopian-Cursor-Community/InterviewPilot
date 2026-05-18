import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// TanStack Start server entry (see wrangler.jsonc main).
export default defineConfig(({ command, mode }) => {
  const envDefine: Record<string, string> = {};
  const loaded = loadEnv(mode, process.cwd(), "VITE_");
  for (const [key, value] of Object.entries(loaded)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  const deployTarget =
    process.env.VERCEL === "1"
      ? "vercel"
      : process.env.NETLIFY === "true"
        ? "netlify"
        : process.env.CF_PAGES === "1" || process.env.CLOUDFLARE === "1"
          ? "cloudflare"
          : "cloudflare";

  const plugins = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    ...(command === "build"
      ? deployTarget === "vercel"
        ? [nitro()]
        : deployTarget === "netlify"
          ? [nitro({ preset: "netlify" })]
          : [
              cloudflare({
                viteEnvironment: { name: "ssr" },
              }),
            ]
      : []),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      server: { entry: "server" },
    }),
    viteReact(),
  ];

  const vercelBuild = deployTarget === "vercel" && command === "build";

  return {
    define: envDefine,
    ...(vercelBuild
      ? {
          ssr: {
            external: ["@cursor/sdk"],
          },
        }
      : {}),
    resolve: {
      alias: {
        "@": `${process.cwd()}/src`,
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    server: { host: "::", port: 8080 },
    plugins,
    optimizeDeps: {
      exclude: ["@cursor/sdk"],
    },
  };
});
