// @ts-check
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests",
  fullyParallel: true,
  reporter: "html",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
