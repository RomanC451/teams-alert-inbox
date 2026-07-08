import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svg = fs.readFileSync(path.join(root, "public", "icon.svg"));

const sizes = [192, 512];

for (const size of sizes) {
  const out = path.join(root, "public", "icons", `icon-${size}.png`);
  await sharp(svg)
    .resize(size, size, { fit: "contain", background: { r: 11, g: 18, b: 32, alpha: 1 } })
    .png()
    .toFile(out);
  console.log(`Wrote ${out}`);
}
