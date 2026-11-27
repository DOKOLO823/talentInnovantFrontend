// Emplacement : app/communaute/lib/imageCompress.ts
// Réduit les photos AVANT l'envoi : moins de données envoyées, moins de charge pour le serveur.

export async function compressImage(
  file: File,
  maxSide = 1600,
  quality = 0.82,
): Promise<File> {
  // Les GIF animés et les non-images sont envoyés tels quels
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * ratio);
    const height = Math.round(bitmap.height * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.fillStyle = "#ffffff"; // évite un fond noir sur les PNG transparents
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );

    // Si la compression n'apporte rien, on garde l'original
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
      type: "image/jpeg",
    });
  } catch {
    return file;
  }
}