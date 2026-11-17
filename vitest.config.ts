import { defineConfig } from "vitest/config";
import path from "node:path";

const src = path.resolve(__dirname, "src");

export default defineConfig({
  resolve: {
    alias: {
      "@": src,
      // Same module swap as tsconfig.json: Firebase resolves to the demo stand-ins.
      "firebase/auth": path.join(src, "lib/demo/auth.ts"),
      "firebase/firestore": path.join(src, "lib/demo/firestore.ts"),
      "firebase/storage": path.join(src, "lib/demo/storage.ts"),
      "firebase-admin/firestore": path.join(src, "lib/demo/admin-firestore.ts"),
    },
  },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
