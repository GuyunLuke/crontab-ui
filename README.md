# Crontab UI 汉化版

基于 [alseambusher/crontab-ui](https://github.com/alseambusher/crontab-ui) 的汉化 fork，支持中英文切换。

> ⚠️ **Vibe Coding 项目**：本项目通过 [Claude Code](https://claude.ai/code) + DeepSeek 以 vibe-coding 方式完成。代码未经人工逐行审查，生产使用请先自行验证。

## 与上游的区别

| 项目 | 原版 | 本 fork |
|---|---|---|
| 界面语言 | 英文 | 中文 / 英文可切换 |
| 字体 | 系统默认 | 中文模式嵌入 MiSans 子集（28KB） |
| dayjs 时间显示 | `2 hours ago` | 中文模式 `2 小时前` |
| 默认行为 | 英文 | 默认英文，设环境变量切中文 |
| 全站限流 | 300 次 / 15 分钟 | **3000 次 / 15 分钟**（v0.4.4 起） |

## 版本变更

### v0.4.4 — 重大更改

**全站限流从 300 次 / 15 分钟提高到 3000 次 / 15 分钟**（`app.js` 的 `express-rate-limit` 配置）。

- 触发原因：反向代理、监控等服务的健康检查（`HEAD /`，约 6 秒一次）也会计入全站限流。300 次的额度在几分钟内就会被探测流量占满，正常打开页面或保存任务时出现 `429 Too Many Requests`。
- 影响范围：所有 HTTP 请求都计数，包括静态资源、页面、`/save`、部署接口。
- 如果你依赖原有的 300 次限制做防刷，请在部署时自行改回。
- 同时将 `package.json` / `package-lock.json` 的版本号同步为 `0.4.4`。`v0.4.3-cn` 的 tag 与代码内版本号不一致（代码里仍是 `0.4.2`）。

## 安装与运行

```bash
git clone https://github.com/GuyunLuke/crontab-ui.git
cd crontab-ui
npm install --omit=dev
node app.js
```

打开 `http://127.0.0.1:8000`。

## 启用中文

```bash
# 任一环境变量以 zh 开头即可
LANG=zh-CN node app.js
LANG=zh_CN.UTF-8 node app.js
APP_LANG=zh-CN node app.js
```

不设环境变量默认英文，完全兼容原版行为。

## Docker

```bash
# 构建
docker build -t crontab-ui-cn .

# 中文模式运行
docker run -d -p 8000:8000 -e LANG=zh-CN crontab-ui-cn

# 挂载数据目录
mkdir -p crontabs/logs
docker run -d -p 8000:8000 \
  -e LANG=zh-CN \
  --mount type=bind,source="$(pwd)"/crontabs/,target=/crontab-ui/crontabs/ \
  crontab-ui-cn
```

## 汉化说明

- 翻译文件在 `locales/`，欢迎提 PR
- 中文模式下嵌入 MiSans Regular 子集 woff2（仅 UI 用到的 ~300 字符，28KB）
- 如需加入新字符，编辑 `locales/zh-CN.json` 后运行 `pyftsubset` 重新生成字体子集

## License

[MIT](LICENSE.md) — 与原项目一致

## 上游

https://github.com/alseambusher/crontab-ui
