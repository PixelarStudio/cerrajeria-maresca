// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import markdoc from "@astrojs/markdoc";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Config Astro 5.x para salida estática (Hostinger)
export default defineConfig({
  integrations: [react(), markdoc(), partytown(), sitemap()],
  output: "static", // export HTML estático

  vite: {
    plugins: [tailwindcss()],
  },
});
