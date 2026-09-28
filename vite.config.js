import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 这里是项目的基础配置,一般不需要改动。
//
// base 用来决定资源(图片 / 视频 / 字体)在最终 HTML 里的路径前缀,
// 部署到 GitHub Pages 时必须设对:
//   - 根用户名仓库 "<用户名>.github.io"  →  期望 base = "/"
//   - 普通仓库  "<用户名>.github.io/<仓库>"  →  期望 base = "/<仓库>/"
//
// 这里从 process.env.BASE_URL 读取,而不是写死。GitHub Actions 跑
// `actions/configure-pages@v5` 那一节时会自动把正确的子路径注入到
// 这个环境变量(root 仓库 = "/",普通仓库 = "/<仓库>/"),所以同一份
// 配置在两种部署形式下都能直接跑通。
//
// 本地 `npm run dev` 时不设 BASE_URL,会落到 "/" 这个默认值,行为
// 和之前完全一致。
export default defineConfig({
  base: process.env.BASE_URL || "/",
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    // 允许 Cloudflare quick tunnel 域名访问本地 dev server,
    // 否则 Vite 的 DNS-rebind 保护会拒绝并返回 403。
    allowedHosts: [".trycloudflare.com"],
  },
  optimizeDeps: {
    force: true,
  },
});
