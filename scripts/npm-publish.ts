import { promises as fs } from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { $ } from "bun";

const DIST_DIR = "iconpkg";
const PKG_PUBLISH_FILE = "package-publish.json";
const README_FILE = "README.md";

async function main() {
  console.log(chalk.blue("📦 Starting publish process..."));

  const distPath = path.resolve(DIST_DIR);

  // 1. Check if dist dir exists
  try {
    await fs.stat(distPath);
  } catch {
    console.error(
      chalk.red(`Error: Output directory '${DIST_DIR}' does not exist.`),
    );
    console.error(chalk.yellow("Please run 'bun run generate' first."));
    process.exit(1);
  }

  // 2. Prepare package.json
  console.log(
    chalk.gray(`Copying ${PKG_PUBLISH_FILE} -> ${DIST_DIR}/package.json`),
  );
  try {
    const pkgContent = await fs.readFile(PKG_PUBLISH_FILE, "utf-8");
    const pkg = JSON.parse(pkgContent);

    // Remove "private" field to allow publishing
    delete pkg.private;

    await fs.writeFile(
      path.join(distPath, "package.json"),
      JSON.stringify(pkg, null, 2),
    );
  } catch (err) {
    console.error(chalk.red(`Failed to copy ${PKG_PUBLISH_FILE}:`), err);
    process.exit(1);
  }

  // 3. Prepare README.md
  try {
    await fs.stat(README_FILE);
    console.log(
      chalk.gray(`Copying ${README_FILE} -> ${DIST_DIR}/${README_FILE}`),
    );
    await fs.copyFile(README_FILE, path.join(distPath, README_FILE));
  } catch {
    console.warn(chalk.yellow(`Warning: ${README_FILE} not found, skipping.`));
  }

  // 4. Publish
  console.log(chalk.blue("🚀 Publishing to npm..."));
  try {
    // Explicitly use npm from shell and pass arguments
    const args = process.argv.slice(2).join(" ");
    await $`cd ${distPath} && npm publish ${args}`;
    console.log(chalk.green("\n✅ Published successfully!"));
  } catch (err) {
    console.error(chalk.red("\n❌ Failed to publish."));
    // Bun shell throws on non-zero exit code
    process.exit(1);
  }
}

main();
