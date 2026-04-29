import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// CHANGE THIS to your GitHub repo name (e.g. "/rapguesser/")
// For user/organization page (repo named <user>.github.io) use "/"
const REPO_BASE = process.env.VITE_BASE ?? "/rapguessernew/";

export default defineConfig({
  base: REPO_BASE,
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
