# 调试网站

这是一个用于调试和测试的网站，支持Node.js运行和Cloudflare Workers部署。

## 功能

1. **错误页面测试**：
   - `/error/404` - 404错误页面
   - `/error/500` - 500错误页面
   - `/error/502` - 502错误页面

2. **静态资源上传**：
   - `/upload` - 上传静态文件的网页，上传完成后会返回资源URL（域名使用etan.fun）

3. **CDN性能测试**：
   - `/test` - 测试网页，包含各种资源用于测试CDN速度

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start
```

服务器将在 `http://localhost:3000` 上运行。

## Cloudflare Workers部署

此项目支持在Cloudflare Workers上部署。部署前需要：

1. 安装Wrangler CLI：
```bash
npm install -g wrangler
```

2. 配置`wrangler.toml`文件中的账户信息：
```toml
account_id = "your-account-id"
zone_id = "your-zone-id"
```

3. 部署到Workers：
```bash
wrangler deploy
```

注意：在Workers环境中，文件上传功能会返回一个虚拟的URL，因为Workers本身不提供持久化文件存储。如果需要真正的文件存储，您可能需要集成R2存储服务。

## 项目结构

- `server.js` - Node.js服务器实现（适用于本地开发和传统部署）
- `worker.js` - Cloudflare Workers兼容入口文件（重构以适应Workers环境）
- `wrangler.toml` - Workers部署配置文件
- `public/error/` - 静态错误页面
- `uploads/` - 本地文件上传目录（仅适用于Node.js版本）