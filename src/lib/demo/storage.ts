/**
 * Stand-in for "firebase/storage" in the demo build: uploads stay in the
 * browser as object URLs and disappear on reload.
 */

export interface StorageReference {
  fullPath: string;
}

const files = new Map<string, string>();

export function getStorage(_app?: unknown) {
  return {};
}

export function ref(_storage: unknown, path: string): StorageReference {
  return { fullPath: path };
}

export async function uploadBytes(target: StorageReference, data: Blob) {
  files.set(target.fullPath, URL.createObjectURL(data));
  return { ref: target };
}

export async function getDownloadURL(target: StorageReference) {
  const url = files.get(target.fullPath);
  if (!url) throw new Error(`No file at ${target.fullPath}`);
  return url;
}
