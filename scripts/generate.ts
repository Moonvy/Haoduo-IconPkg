import { promises as fs } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { locate } from "@iconify/json";
import icon_collections from "@iconify/json/collections.json";
import chalk from "chalk";
import { SVG, cleanupSVG } from "@iconify/tools";
import { replaceIDs } from "@iconify/utils/lib/svg/id";
import { getIconData } from "@iconify/utils/lib/icon-set/get-icon";
import { iconToSVG } from "@iconify/utils/lib/svg/build";
import { createMinMPLookupDict } from "min-mphash";

/**
 * 配置常量
 */
const OUTPUT_DIR = "iconpkg";
const TEMPLATE_DIR = path.join("scripts", "template");

/**
 * 图标数据接口
 */
interface IconData {
  name: string;
  symbolId: string;
}

/**
 * 包清单数据接口 (manifest.json)
 * 用于在生成代码阶段读取
 */
interface PackageManifest {
  pkg: string;
  icons: IconData[];
  lookupMap: Record<string, string[]>;
  chunks: { id: string; file: string }[];
}

/**
 * 图标包生成器类
 */
class IconPackageGenerator {
  private args: { assets: boolean; code: boolean };

  constructor() {
    // 解析命令行参数
    const { values } = parseArgs({
      args: Bun.argv,
      options: {
        assets: {
          type: "boolean",
          default: true,
        },
        code: {
          type: "boolean",
          default: true,
        },
        "only-assets": {
          type: "boolean",
        },
        "only-code": {
          type: "boolean",
        },
      },
      strict: true,
      allowPositionals: true,
    });

    // 处理互斥参数逻辑
    if (values["only-assets"]) {
      this.args = { assets: true, code: false };
    } else if (values["only-code"]) {
      this.args = { assets: false, code: true };
    } else {
      this.args = {
        assets: values.assets ?? true,
        code: values.code ?? true,
      };
    }
  }

  /**
   * 主执行入口
   */
  async run() {
    try {
      console.log(chalk.bold.cyan("🚀 开始生成图标包..."));
      console.log(
        chalk.gray(`模式: Assets=${this.args.assets}, Code=${this.args.code}`),
      );

      // 确保输出目录存在
      await fs.mkdir(OUTPUT_DIR, { recursive: true });

      // 如果需要生成代码，先构建 core.js
      if (this.args.code) {
        await this.buildCoreJs();
      }

      const allPkgNames = Object.keys(icon_collections);
      const allIcons: { pkg: string; icons: IconData[] }[] = [];

      for (const pkg of allPkgNames) {
        // 第一步：生成 SVG 资源 (耗时)
        if (this.args.assets) {
          await this.generateAssets(pkg);
        }

        // 第二步：生成代码和预览 (快速)
        if (this.args.code) {
          const manifest = await this.readManifest(pkg);
          if (manifest) {
            await this.generateCode(manifest);
            await this.generatePreview(manifest);
            allIcons.push({ pkg, icons: manifest.icons });
          } else {
            console.warn(
              chalk.yellow(`⚠️ 跳过 ${pkg} 代码生成 (未找到 manifest.json)`),
            );
          }
        }
      }

      // 生成全局索引页面
      if (this.args.code) {
        await this.generateMainIndex(allIcons, allPkgNames);
      }

      console.log(chalk.bold.green("\n✨ 所有任务完成!"));
    } catch (err) {
      console.error(chalk.red("❌ 生成过程发生错误:"), err);
      process.exit(1);
    }
  }

  /**
   * 构建 core.js
   */
  async buildCoreJs() {
    console.log(chalk.gray("📦 正在打包 core.ts -> core.js..."));
    await Bun.build({
      entrypoints: [path.join("scripts", "core.ts")],
      outdir: OUTPUT_DIR,
      target: "browser",
      format: "esm",
    });
    console.log(chalk.blue(`✓ 生成 core.js`));
  }

  /**
   * 读取包清单文件
   */
  async readManifest(pkg: string): Promise<PackageManifest | null> {
    const manifestPath = path.join(OUTPUT_DIR, pkg, "manifest.json");
    try {
      const content = await fs.readFile(manifestPath, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      return null;
    }
  }

  /**
   * 第一步：生成 SVG 资源
   */
  async generateAssets(pkg: string) {
    console.log(chalk.blue(`\n🎨 [Assets] 处理图标包: ${pkg}`));
    const pkgDir = path.join(OUTPUT_DIR, pkg);

    // 清理并重建目录
    await fs.rm(pkgDir, { recursive: true, force: true });
    await fs.mkdir(pkgDir, { recursive: true });

    // 定位图标集文件
    const file = locate(pkg);
    if (!file) {
      console.error(chalk.red(`❌ 无法找到图标包文件: ${pkg}`));
      return;
    }

    // 加载并解析图标集
    const content = await fs.readFile(file, "utf-8");
    const iconSet = JSON.parse(content);
    const icons = iconSet.icons;
    const iconNames = Object.keys(icons);

    console.log(chalk.gray(`   发现 ${iconNames.length} 个图标`));

    // 分块处理，每块 200 个图标
    const CHUNK_SIZE = 200;
    const chunks = this.chunkArray(iconNames, CHUNK_SIZE);

    const globalIconList: IconData[] = [];
    const lookupMap: Record<string, string[]> = {};
    const chunkMetadata: { id: string; file: string }[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkNames = chunks[i];
      const chunkId = (i + 1).toString().padStart(2, "0");
      const symbols: string[] = [];

      for (const name of chunkNames) {
        const iconData = getIconData(iconSet, name);
        if (!iconData) {
          console.error(chalk.red(`   缺失图标 ${pkg}:${name}`));
          continue;
        }

        const symbolId = `hd-icon-${pkg}-${name}`;

        // 计算 SVG 数据 (viewBox, body)
        const renderData = iconToSVG(iconData, { height: "auto" });
        const viewBox = `${renderData.attributes.viewBox}`;
        const width = renderData.attributes.width;
        const height = renderData.attributes.height;
        const bodyContent = renderData.body;

        const svgContent = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${bodyContent}</svg>`;
        const svg = new SVG(svgContent);

        try {
          cleanupSVG(svg);
          // ID 作用域隔离
          const scopedContent = replaceIDs(svg.toString(), `${symbolId}-`);
          const scopedSvg = new SVG(scopedContent);
          const body = scopedSvg.getBody();
          const v = scopedSvg.viewBox;
          const symbolViewBox = `${v.left} ${v.top} ${v.width} ${v.height}`;
          const symbol = `<symbol id="${symbolId}" viewBox="${symbolViewBox}">${body}</symbol>`;
          symbols.push(symbol);

          if (!iconData.hidden) {
            globalIconList.push({ name, symbolId });
          }
        } catch (err) {
          console.error(chalk.red(`   处理图标出错 ${pkg}:${name}`), err);
        }
      }

      // 生成 Sprite 文件
      const spriteContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${symbols.join("")}</svg>`;
      const spriteFileName = `${pkg}-${chunkId}.svg`;
      await fs.writeFile(path.join(pkgDir, spriteFileName), spriteContent);

      // 更新查找表
      if (!lookupMap[spriteFileName]) {
        lookupMap[spriteFileName] = [];
      }
      chunkNames.forEach((name) => lookupMap[spriteFileName].push(name));

      chunkMetadata.push({ id: chunkId, file: spriteFileName });
    }

    // 保存 manifest.json 供代码生成阶段使用
    const manifest: PackageManifest = {
      pkg,
      icons: globalIconList,
      lookupMap,
      chunks: chunkMetadata,
    };

    await fs.writeFile(
      path.join(pkgDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
    );
    console.log(chalk.green(`   ✓ 生成资源文件 (${chunks.length} chunks)`));
  }

  /**
   * 第二步：生成代码 (pkg-index.js, package.json, icons.json)
   */
  async generateCode(manifest: PackageManifest) {
    const { pkg, icons, lookupMap } = manifest;
    // console.log(chalk.blue(`\n💻 [Code] 生成代码: ${pkg}`));
    const pkgDir = path.join(OUTPUT_DIR, pkg);

    // 1. 生成 icons.json (元数据)
    const meta = {
      pkg,
      total: icons.length.toString(),
      icons: icons.map((i) => i.name),
    };
    await fs.writeFile(
      path.join(pkgDir, "icons.json"),
      JSON.stringify(meta, null, 2),
    );

    // 2. 生成 MinMPLookup 查找表
    const lookupData = createMinMPLookupDict(lookupMap, { outputBinary: true });
    const lookupDataB64 = Buffer.from(lookupData).toString("base64");

    // 3. 生成 chunks 映射代码
    const chunkKeys = Object.keys(lookupMap);
    const chunksMapCode = chunkKeys
      .map((key) => `  "${key}": new URL("./${key}", import.meta.url).href`)
      .join(",\n");

    // 4. 生成临时入口文件 src-index.ts
    const tempEntryFile = path.join(pkgDir, "src-index.ts");
    const srcContent = `
import { register, HdIcon } from "../../scripts/core.ts";

const lookup = "${lookupDataB64}";

const chunks = {
${chunksMapCode}
};

register('${pkg}', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});

export { HdIcon };
`;
    await fs.writeFile(tempEntryFile, srcContent);

    // 5. 使用 Bun.build 打包为 pkg-index.js
    await Bun.build({
      entrypoints: [tempEntryFile],
      outdir: pkgDir,
      target: "browser",
      format: "esm",
      minify: false,
      naming: "pkg-index.js", // 指定输出文件名
    });

    // 6. 清理临时文件
    await fs.rm(tempEntryFile);

    // 7. 生成 package.json
    const packageJson = {
      name: `@haoduo-icon/${pkg}`,
      version: "1.0.0",
      description: `Icon package for ${pkg}`,
      type: "module",
      main: "./pkg-index.js",
      module: "./pkg-index.js",
      files: ["pkg-index.js", "*.svg", "manifest.json", "icons.json"],
      sideEffects: true,
      license: "MIT",
      publishConfig: {
        access: "public",
        registry: "https://registry.npmjs.org/",
      },
    };

    await fs.writeFile(
      path.join(pkgDir, "package.json"),
      JSON.stringify(packageJson, null, 2),
    );

    // console.log(chalk.green(`   ✓ 生成 pkg-index.js & package.json`));
  }

  /**
   * 生成预览页面 (index.html)
   */
  async generatePreview(manifest: PackageManifest) {
    const { pkg, icons } = manifest;
    const pkgDir = path.join(OUTPUT_DIR, pkg);

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

    const template = await fs.readFile(
      path.join(TEMPLATE_DIR, "package.html"),
      "utf-8",
    );
    // 需要更新 package.html 模板中的 import 路径，或者确保模板使用了 {{mainScript}} 变量
    // 这里我们假设模板中写死了 ./index.js，我们需要替换它
    const htmlContent = template
      .replaceAll("{{pkgName}}", pkg)
      .replaceAll("{{iconCount}}", icons.length.toString())
      .replaceAll("{{iconItems}}", iconItems)
      .replaceAll("./index.js", "./pkg-index.js"); // 替换引用的脚本

    await fs.writeFile(path.join(pkgDir, "index.html"), htmlContent);
    console.log(chalk.green(`   ✓ 生成预览 ${pkgDir}/index.html`));
  }

  /**
   * 生成全局入口页面
   */
  async generateMainIndex(
    allIcons: { pkg: string; icons: IconData[] }[],
    packageNames: string[],
  ) {
    console.log(chalk.blue(`\n🌐 生成全局索引页面...`));

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
      </a>`;
      })
      .join("");

    const importScripts = `
    <!-- core.js is bundled into each package, so we don't strictly need it globally if we load packages -->
    <!-- But for the global index, we are loading multiple packages. Global registry handles this. -->
    ${packageNames.map((pkg) => `<script type="module" src="./${pkg}/pkg-index.js"></script>`).join("\n    ")}`;

    const template = await fs.readFile(
      path.join(TEMPLATE_DIR, "index.html"),
      "utf-8",
    );
    const htmlContent = template
      .replaceAll("{{packageCards}}", packageCards)
      .replaceAll("{{importScripts}}", importScripts);

    await fs.writeFile(path.join(OUTPUT_DIR, "index.html"), htmlContent);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }
}

// 运行程序
new IconPackageGenerator().run();
