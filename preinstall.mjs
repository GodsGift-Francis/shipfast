// Cross-platform preinstall guard (runs on Windows cmd/PowerShell, macOS, Linux).
// Replaces the previous `sh -c` script, which fails on Windows where no `sh` exists.
//
// 1. Removes stray npm/yarn lockfiles so the workspace stays pnpm-only.
// 2. Refuses to install under npm or yarn (this is a pnpm workspace).
import { existsSync, rmSync } from "node:fs";

for (const file of ["package-lock.json", "yarn.lock"]) {
  if (existsSync(file)) {
    try {
      rmSync(file, { force: true });
    } catch {
      // best-effort cleanup; ignore failures
    }
  }
}

const userAgent = process.env.npm_config_user_agent ?? "";
if (!userAgent.startsWith("pnpm/")) {
  console.error("\nThis workspace uses pnpm. Please run `pnpm install` instead of npm or yarn.\n");
  process.exit(1);
}
