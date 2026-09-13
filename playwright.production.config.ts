import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// Run after npm run build; never starts a development server or rebuilds.
export default defineConfig({
  ...base,
  workers: 2,
  use: { ...base.use, baseURL: "http://127.0.0.1:3100" },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
  },
});
