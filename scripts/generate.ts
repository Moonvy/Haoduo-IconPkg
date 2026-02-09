import { promises as fs } from "node:fs";
import path from "node:path";
import { locate } from "@iconify/json";
import icon_collections from "@iconify/json/collections.json";
import chalk from "chalk";
import { SVG, cleanupSVG, parseSVG } from "@iconify/tools";
import { replaceIDs } from "@iconify/utils/lib/svg/id";
import { getIconData } from "@iconify/utils/lib/icon-set/get-icon";
import { iconToSVG } from "@iconify/utils/lib/svg/build";
import { createMinMPLookupDict } from "min-mphash";

const OUTPUT_DIR = "iconpkg";

// Start unicode from Private Use Area (Unused for SVG, but kept if needed for fallback map)
// let START_UNICODE = 0xe000;

interface Config {
  packages: string[];
}

interface IconData {
  name: string;
  symbolId: string;
}

// Global list to track all icons for the preview page
const allIcons: { pkg: string; icons: IconData[] }[] = [];

// Helper to chunk array
function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// Function to generate SVG sprite package
async function generatePackage(pkg: string): Promise<void> {
  console.log(chalk.blue(`\nProcessing package: ${pkg}`));

  const pkgDir = path.join(OUTPUT_DIR, pkg);

  // Clean/Create directory
  await fs.rm(pkgDir, { recursive: true, force: true });
  await fs.mkdir(pkgDir, { recursive: true });

  // Locate the icon set
  const file = locate(pkg);
  if (!file) {
    console.error(chalk.red(`Could not locate icons for package: ${pkg}`));
    return;
  }

  // Load icon set
  const content = await fs.readFile(file, "utf-8");
  const iconSet = JSON.parse(content);
  const icons = iconSet.icons;
  const iconNames = Object.keys(icons);

  console.log(chalk.gray(`Found ${iconNames.length} icons`));

  // Split into chunks of 200
  const CHUNK_SIZE = 200;
  const chunks = chunkArray(iconNames, CHUNK_SIZE);

  const globalIconList: IconData[] = [];
  const chunkMetadata: any[] = [];

  const lookupMap: Record<string, string[]> = {};
  for (let i = 0; i < chunks.length; i++) {
    const chunkNames = chunks[i];
    const chunkId = (i + 1).toString().padStart(2, "0"); // 01, 02...

    const symbols: string[] = [];
    const chunkIconList: IconData[] = [];

    // Process icons in this chunk
    for (const name of chunkNames) {
      // Use getIconData to resolve full icon data (including defaults and aliases)
      const iconData = getIconData(iconSet, name);
      if (!iconData) {
        console.error(chalk.red(`Could not locate icon ${pkg}:${name}`));
        continue;
      }

      const symbolId = `hd-icon-${pkg}-${name}`;

      // Use iconToSVG to calculate viewBox and body with transforms applied
      const renderData = iconToSVG(iconData, {
        height: "auto", // preserve aspect ratio
      });

      // Construct SVG content using renderData
      const viewBox = `${renderData.attributes.viewBox}`;
      const width = renderData.attributes.width;
      const height = renderData.attributes.height;
      const bodyContent = renderData.body;

      const svgContent = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${bodyContent}</svg>`;
      const svg = new SVG(svgContent);

      try {
        cleanupSVG(svg);

        // Scope IDs using symbolId as prefix
        const scopedContent = replaceIDs(svg.toString(), `${symbolId}-`);

        // Extract body and viewBox from the scoped content
        const scopedSvg = new SVG(scopedContent);
        const body = scopedSvg.getBody();
        const v = scopedSvg.viewBox;
        const symbolViewBox = `${v.left} ${v.top} ${v.width} ${v.height}`;

        const symbol = `<symbol id="${symbolId}" viewBox="${symbolViewBox}">${body}</symbol>`;
        symbols.push(symbol);
      } catch (err) {
        console.error(chalk.red(`Error processing icon ${pkg}:${name}`), err);
        // Fallback or skip? Skipping might be safer to avoid breaking the build.
        continue;
      }
      chunkIconList.push({ name, symbolId });

      // Only add to global list if NOT hidden
      if (!iconData.hidden) {
        globalIconList.push({ name, symbolId });
      }
    }

    // Generate Sprite for this chunk
    const spriteContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${symbols.join("")}</svg>`;
    const spriteFileName = `${pkg}-${chunkId}.svg`;
    await fs.writeFile(path.join(pkgDir, spriteFileName), spriteContent);
    console.log(
      chalk.gray(`  Generated ${spriteFileName} (${chunkNames.length} icons)`),
    );
    // Generate MinMPH Filter for this chunk? No, we use global MinMPLookup now.
    // Just store the info for global lookup generation
    chunkNames.forEach((name) => {
      if (!lookupMap[spriteFileName]) {
        lookupMap[spriteFileName] = [];
      }
      lookupMap[spriteFileName].push(name);
    });

    chunkMetadata.push({
      id: chunkId,
      file: spriteFileName,
      // No per-chunk filter needed anymore
    });
  }

  // Add to global list for preview
  allIcons.push({ pkg, icons: globalIconList });

  // 2. Generate Metadata (pkg.json)
  const meta: Record<string, string> = {
    pkg,
    total: globalIconList.length.toString(),
    icons: globalIconList.map((i) => i.name) as any,
  };
  await fs.writeFile(
    path.join(pkgDir, `icons.json`),
    JSON.stringify(meta, null, 2),
  );
  console.log(chalk.green(`✓ Generated icons.json`));

  // 3. Generate Global Lookup Table
  console.log(chalk.gray(`  Generating MinMPLookup for ${pkg}...`));
  const lookupData = createMinMPLookupDict(lookupMap, { outputBinary: true });
  const lookupDataB64 = Buffer.from(lookupData).toString("base64");

  // 4. Generate Registration Script (index.js)
  // Exports global lookup data and explicit chunk URLs for bundlers
  const chunkKeys = Object.keys(lookupMap);
  const chunksMapCode = chunkKeys
    .map((key) => `  "${key}": new URL("./${key}", import.meta.url).href`)
    .join(",\n");

  const indexJsContent = `
import { register } from '../core.js';

const lookup = "${lookupDataB64}";

const chunks = {
${chunksMapCode}
};

register('${pkg}', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
`;
  await fs.writeFile(path.join(pkgDir, "index.js"), indexJsContent);
  console.log(chalk.green(`✓ Generated index.js (with MinMPLookup)`));

  // 5. Generate Per-Package Preview HTML with INLINE scripts
  // Note: For preview, we still want it to work.
  // Maybe for the PREVIEW HTML specifically, we still inline everything?
  // User check: "index.js 不要内联...". This refers to the distributable code.
  // The PREVIEW page is a separate verification tool.
  // I will update the preview generation to try and work with the new core logic.
  // If core logic fetches, preview fetches.

  // 5. Generate Per-Package Preview HTML with External Script
  const htmlContent = generatePackagePreviewHtml(pkg, globalIconList);
  // Note: removed spriteContent arg as we don't have a single sprite anymore
  await fs.writeFile(path.join(pkgDir, "index.html"), htmlContent);
  console.log(chalk.green(`✓ Generated index.html (Preview)`));
}

// Function to generate preview HTML
function generatePackagePreviewHtml(pkg: string, icons: IconData[]): string {
  const iconItems = icons
    .map((icon) => {
      const iconName = `${pkg}:${icon.name}`;
      return `
        <div class="icon-item" onclick="copyToClipboard('${iconName}')" title="Click to copy">
            <hd-icon icon="${iconName}"></hd-icon>
            <span class="name">${icon.name}</span>
        </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pkg} - Icon Preview</title>
    <style>
        :root {
            --bg-color: #f9fafb;
            --card-bg: #ffffff;
            --text-primary: #111827;
            --text-secondary: #6b7280;
            --border-color: #e5e7eb;
            --hover-bg: #f3f4f6;
            --accent-color: #3b82f6;
        }
        body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            padding: 2rem;
            margin: 0;
        }
        h1 {
            font-size: 2rem;
            margin-bottom: 2rem;
            text-align: center;
            font-weight: 700;
            text-transform: capitalize;
        }
        .search-container {
            max-width: 600px;
            margin: 0 auto 3rem;
            position: relative;
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        input[type="text"] {
            flex: 1;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            font-size: 1rem;
            box-sizing: border-box;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        input[type="text"]:focus {
            outline: none;
            border-color: var(--accent-color);
            ring: 2px solid var(--accent-color);
        }
        input[type="color"] {
            width: 50px;
            height: 50px;
            border: none;
            padding: 0;
            background: none;
            cursor: pointer;
            border-radius: 8px; /* Optional rounded */
            overflow: hidden;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 1rem;
        }
        .icon-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .icon-item:hover {
            border-color: var(--accent-color);
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .icon-item:active {
            transform: translateY(0);
        }
        hd-icon {
            font-size: 32px;
            margin-bottom: 0.75rem;
            color: var(--icon-color, var(--text-primary));
            transition: color 0.2s ease;
        }
        .name {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-align: center;
            word-break: break-all;
        }
        .toast {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: #1f2937;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 9999px;
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: none;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            font-weight: 500;
            z-index: 100;
        }
        .toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    </style>
</head>
<body>
    <h1>${pkg} <span style="font-weight:normal; font-size: 0.6em; color: var(--text-secondary)">(${icons.length})</span></h1>
    
    <div class="search-container">
        <input type="text" id="search" placeholder="Search icons..." oninput="filterIcons()">
        <input type="color" id="colorPicker" value="#111827" oninput="changeColor(this.value)" title="Change icon color">
    </div>

    <div class="grid" id="iconGrid">
        ${iconItems}
    </div>

    <div id="toast" class="toast">Copied to clipboard!</div>

    <!-- External Registration Script -->
    <script type="module" src="./index.js"></script>

    <script>
        function copyToClipboard(text) {
            navigator.clipboard.writeText('<hd-icon icon="' + text + '"></hd-icon>').then(() => {
                const toast = document.getElementById('toast');
                toast.textContent = 'Copied: ' + text;
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 2000);
            });
        }

        function filterIcons() {
            const input = document.getElementById('search');
            const filter = input.value.toLowerCase();
            const grid = document.getElementById('iconGrid');
            const items = grid.getElementsByClassName('icon-item');

            for (let i = 0; i < items.length; i++) {
                const span = items[i].getElementsByTagName("span")[0];
                const txtValue = span.textContent || span.innerText;
                if (txtValue.toLowerCase().indexOf(filter) > -1) {
                    items[i].style.display = "";
                } else {
                    items[i].style.display = "none";
                }
            }
        }

        function changeColor(color) {
            document.documentElement.style.setProperty('--icon-color', color);
        }
    </script>
</body>
</html>`;
}

// Global core JS content (loaded once)
let coreJsContent: string = "";

async function main() {
  try {
    // Ensure output dir exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Build core.js (Bundled with MinMPH)
    // We use Bun.build to ensure imports like 'min-mphash' are bundled.
    console.log(chalk.gray("Bundling core.ts -> core.js..."));
    await Bun.build({
      entrypoints: [path.join("scripts", "core.ts")],
      outdir: OUTPUT_DIR,
      target: "browser",
      format: "esm", // or 'iife' if we want strictly no exports? But we export 'register'.
      // Note: 'esm' is good for <script type="module">.
    });
    console.log(chalk.blue(`✓ Generated core.js in ${OUTPUT_DIR}/`));

    // Read generated core.js for inlining in preview
    coreJsContent = await fs.readFile(
      path.join(OUTPUT_DIR, "core.js"),
      "utf-8",
    );

    let allPkgNames = Object.keys(icon_collections);

    for (const pkg of allPkgNames) {
      await generatePackage(pkg);
    }

    // 6. Generate Main Index Page
    const mainIndexHtml = generateMainIndexHtml(allIcons, allPkgNames);
    await fs.writeFile(path.join(OUTPUT_DIR, "index.html"), mainIndexHtml);
    console.log(chalk.green(`✓ Generated global index.html`));

    console.log(chalk.bold.green("\nAll Done! 🚀"));
  } catch (err) {
    console.error(chalk.red("Error generating icons:"), err);
    process.exit(1);
  }
}

function generateMainIndexHtml(
  allIcons: { pkg: string; icons: IconData[] }[],
  packageNames: string[],
): string {
  const packageCards = allIcons
    .map(({ pkg, icons }) => {
      const collectionInfo = (icon_collections as any)[pkg];
      const displayName = collectionInfo ? collectionInfo.name : pkg;

      const previewIcons = icons
        .slice(0, 10)
        .map((icon) => {
          const iconName = `${pkg}:${icon.name}`;
          return `<hd-icon icon="${iconName}" title="${icon.name}"></hd-icon>`;
        })
        .join("");

      return `
      <a href="./${pkg}/index.html" class="package-card">
        <div class="card-header">
            <div class="title-group">
                <h2>${displayName}</h2>
                <span class="subtitle">${pkg}</span>
            </div>
            <span class="badge">${icons.length}</span>
        </div>
        <div class="preview-grid">
            ${previewIcons}
        </div>
      </a>
    `;
    })
    .join("");

  const importScripts = `
    <script type="module" src="./core.js"></script>
    ${packageNames.map((pkg) => `<script type="module" src="./${pkg}/index.js"></script>`).join("\n    ")}
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Haoduo Icon Packages</title>
    <style>
        :root {
            --bg-color: #f3f4f6;
            --card-bg: #ffffff;
            --text-primary: #111827;
            --text-secondary: #6b7280;
            --accent-color: #3b82f6;
            --hover-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            padding: 2rem;
            margin: 0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            margin-bottom: 3rem;
            font-size: 2.5rem;
            color: var(--text-primary);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
        }
        .package-card {
            background: var(--card-bg);
            border-radius: 12px;
            padding: 1.5rem;
            text-decoration: none;
            color: inherit;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            display: block;
        }
        .package-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--hover-shadow);
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 1rem;
        }
        .title-group {
            display: flex;
            flex-direction: column;
        }
        h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
        }
        .subtitle {
            font-size: 0.875rem;
            color: var(--text-secondary);
            font-family: monospace;
            margin-top: 0.25rem;
        }
        .badge {
            background-color: #e0f2fe;
            color: #0369a1;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            white-space: nowrap;
        }
        .preview-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 0.5rem;
            justify-items: center;
        }
        hd-icon {
            font-size: 24px;
            color: var(--text-secondary);
        }
        .package-card:hover hd-icon {
            color: var(--text-primary);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Haoduo IconPkg</h1>
        <div class="grid">
            ${packageCards}
        </div>
    </div>
    
    <!-- Use Native Imports to preserve import.meta.url context -->
    ${importScripts}
</body>
</html>`;
}

main();
