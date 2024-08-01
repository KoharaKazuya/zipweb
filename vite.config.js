import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",

      // Web App Manifest
      manifest: {
        name: "Zip Web",
        short_name: "Zip Web",
        display: "fullscreen",
        start_url: ".",
        theme_color: "#77c",
        background_color: "#eee",
        icons: [
          {
            src: "icon_512x512.svg",
            sizes: "512x512",
          },
        ],
      },
    }),
  ],
});
