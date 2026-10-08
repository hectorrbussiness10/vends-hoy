import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

export async function saveImage(file: File): Promise<string> {
  const safeName = file.name.replace(/[^\w.\-]+/g, "-").slice(0, 80) || "foto.jpg";
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`fotos/${Date.now()}-${safeName}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || "application/octet-stream",
    });
    return blob.url;
  }
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${safeName}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);
  return `/uploads/${filename}`;
}
