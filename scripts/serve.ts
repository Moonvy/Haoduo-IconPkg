import { serve } from "bun";
import { join } from "node:path";
import { stat } from "node:fs/promises";

const port = 3000;
const root = join(import.meta.dir, "..");

console.log(`Serving ${root} on http://localhost:${port}`);

serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;
    if (path === "/") path = "/iconpkg/index.html";

    const filePath = join(root, path);
    try {
      const stats = await stat(filePath);
      if (stats.isDirectory()) {
        // try index.html
        return new Response(Bun.file(join(filePath, "index.html")));
      }
      return new Response(Bun.file(filePath));
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  },
});
