import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Service Worker の更新戦略
      // autoUpdate：新しいバージョンが出たら自動で更新する
      registerType: "autoUpdate",

      // Service Worker に含めるファイルのパターン
      includeAssets: [
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/apple-touch-icon.png",
      ],

      // Web App Manifest の設定
      manifest: {
        name: "封筒かんたん家計簿",
        short_name: "家計簿",
        description: "封筒ごとにお金を管理するシンプルな家計簿アプリ",
        theme_color: "#4A90E2",
        background_color: "#f5f5f5",

        // display: standalone → ブラウザのUIなしでアプリのように起動
        display: "standalone",

        // スマホの向き（portrait = 縦向き固定）
        orientation: "portrait",

        // アプリ起動時の最初のURL
        start_url: "/",

        // スコープ（このURL以下をPWAとして扱う）
        scope: "/",

        // アイコン設定
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      // Service Worker の詳細設定（Workbox）
      workbox: {
        // キャッシュするファイルのパターン
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],

        // ナビゲーションリクエスト（ページ遷移）はすべて index.html を返す
        // SPAに必要な設定
        navigateFallback: "index.html",

        // Supabase への通信はキャッシュしない
        // （常に最新のデータを取得するため）
        navigateFallbackDenylist: [/^\/api/, /supabase/],

        // ランタイムキャッシュの設定
        runtimeCaching: [
          {
            // Google Fonts などの外部リソースをキャッシュ
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1年
              },
            },
          },
        ],
      },

      // 開発環境でも Service Worker を有効にする（確認用）
      devOptions: {
        enabled: false, // 開発中は無効（trueにすると確認できる）
      },
    }),
  ],
});