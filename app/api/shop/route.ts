import { promises as fs } from "fs";
import path from "path";
import { SHOP_PRICES } from "@/lib/shopPrices";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function toTitle(input: string) {
  return input
    .replace(/[-_]+/g, " ")
    .replace(/\.[^/.]+$/, "")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  if (!category) {
    return Response.json({ items: [] });
  }

  const baseDir = path.join(process.cwd(), "public", "store", category);

  try {
    const files = await fs.readdir(baseDir, { withFileTypes: true });
    const items = files
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .map((name) => {
        const id = `${category}/${name}`;
        return {
          id,
          name: toTitle(name),
          image: `/store/${category}/${name}`,
          price: SHOP_PRICES[id] ?? null,
        };
      });

    return Response.json({ items });
  } catch {
    return Response.json({ items: [] });
  }
}
