import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import chalk from "chalk";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ICON_PKG_DIR = join(__dirname, "../iconpkg");

async function publishPackage(pkgName: string) {
  const pkgDir = join(ICON_PKG_DIR, pkgName);
  console.log(chalk.blue(`📦 Publishing ${pkgName}...`));

  return new Promise<void>((resolve, reject) => {
    const process = spawn("npm", ["publish", "--access", "public"], {
      cwd: pkgDir,
      stdio: "inherit",
      shell: true,
    });

    process.on("close", (code) => {
      if (code === 0) {
        console.log(chalk.green(`✅ Successfully published ${pkgName}`));
        resolve();
      } else {
        console.error(
          chalk.red(`❌ Failed to publish ${pkgName} (exit code ${code})`),
        );
        // Resolve anyway to continue with other packages
        resolve();
      }
    });

    process.on("error", (err) => {
      console.error(chalk.red(`❌ Error publishing ${pkgName}:`, err));
      resolve();
    });
  });
}

async function main() {
  try {
    const entries = await readdir(ICON_PKG_DIR, { withFileTypes: true });
    const packages = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    console.log(chalk.cyan(`🚀 Found ${packages.length} packages to publish`));

    for (const pkg of packages) {
      await publishPackage(pkg);
    }

    console.log(chalk.green("\n✨ All publishing tasks completed!"));
  } catch (error) {
    console.error(chalk.red("Error reading icon packages directory:", error));
    process.exit(1);
  }
}

main();
