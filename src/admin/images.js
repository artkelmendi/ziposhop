import { supabase } from "./client";

async function compress(file, maxWidth) {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  try {
    const factor = Math.min(
      1,
      maxWidth / Math.max(bitmap.width, bitmap.height),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * factor));
    canvas.height = Math.max(1, Math.round(bitmap.height * factor));
    canvas
      .getContext("2d")
      .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.84),
    );
    if (!blob) throw new Error("Image conversion failed");
    if (blob.size > 3145728)
      throw new Error(
        "Fotografia është shumë e madhe. Provo një fotografi më të vogël.",
      );
    return blob;
  } finally {
    bitmap.close();
  }
}

// Upload on Save, so abandoning an editor never leaves unused uploads behind.
export async function uploadImages(entries) {
  const uploaded = [];
  const images = [];
  try {
    for (const entry of entries) {
      if (!entry.file) {
        images.push({
          url: entry.url,
          thumbnail: entry.thumbnail || entry.url,
        });
        continue;
      }
      const id = crypto.randomUUID();
      const [large, small] = await Promise.all([
        compress(entry.file, 1600),
        compress(entry.file, 640),
      ]);
      const pair = [];
      for (const [name, blob] of [
        ["large", large],
        ["small", small],
      ]) {
        const path = `${id}-${name}.${blob.type === "image/webp" ? "webp" : "png"}`;
        const { error } = await supabase.storage
          .from("product-media")
          .upload(path, blob, {
            contentType: blob.type,
            cacheControl: "31536000",
            upsert: false,
          });
        if (error) throw error;
        uploaded.push(path);
        pair.push(
          supabase.storage.from("product-media").getPublicUrl(path).data
            .publicUrl,
        );
      }
      images.push({ url: pair[0], thumbnail: pair[1] });
    }
    return { images, uploaded };
  } catch (error) {
    await removeUploads(uploaded);
    throw error;
  }
}

export async function removeUploads(paths) {
  if (paths.length) await supabase.storage.from("product-media").remove(paths);
}

export function productImages(product) {
  if (product?.images?.length) return product.images;
  const urls = [
    product?.image,
    ...(product?.views || []).map((view) => view.at(-1)),
    ...(product?.finishes || []).map((finish) => finish.at(-1)),
  ].filter(Boolean);
  return [...new Set(urls)].map((url) => ({ url, thumbnail: url }));
}
