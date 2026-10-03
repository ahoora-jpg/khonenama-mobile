import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import type { ImagePickerAsset } from "expo-image-picker";
import { apiRequest } from "../api/client";

export async function uploadBusinessPhoto(asset: ImagePickerAsset, token: string) {
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > 1920) context.resize(asset.width >= asset.height ? { width: 1920, height: null } : { height: 1920, width: null });
  const image = await context.renderAsync();
  const prepared = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.82 });
  try {
    const info = await FileSystem.getInfoAsync(prepared.uri);
    if (!info.exists || info.size > 8 * 1024 * 1024) throw new Error("حجم عکس زیاد است؛ عکس کوچک‌تری انتخاب کنید.");
    const body = new FormData();
    body.append("file", { uri: prepared.uri, name: "business-photo.jpg", type: "image/jpeg" } as unknown as Blob);
    return await apiRequest("/api/me/business/media/upload", { method: "POST", body }, token);
  } finally {
    await FileSystem.deleteAsync(prepared.uri, { idempotent: true }).catch(() => undefined);
  }
}
