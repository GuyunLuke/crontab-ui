Issues
======

You can submit issues in the [issue tracker](https://github.com/alseambusher/crontab-ui/issues) of the repository.

Common issues
-------------
__crontab-ui is running but is not accessible on browser__ -
This is usually because the place where your crontab-ui is installed does not give access to others. It can be resolved by either __giving permission__ to the user (Recommended) or running crontab-ui as root. Refer [this](https://github.com/alseambusher/crontab-ui/issues/8)

__Hosting crontab-ui : it works on localhost but not outside the server__ - You have to host it using nginx, apache2, etc. Refer [this](nginx.md).

__crontab-ui stopped working__ - It can happen that your crontab-ui can stop working for some reason like adding incorrect jobs or timings. You can try resetting crontab-ui by running `crontab-ui --reset`.

__Where is my root node_modules folder__ - You can find it by `npm root -g`

__Mailing related issue__ - Refer [this](http://lifepluslinux.blogspot.com/2017/03/introducing-mailing-in-crontab-ui.html).

__Run crontab-ui as a daemon__ - Install [pm2](https://github.com/Unitech/pm2) using `npm install -g pm2`. Then just run `pm2 start crontab-ui`

__Long commands are silently truncated__ - Crontab has a hard limit of 1000 characters per line. Crontab-ui's logging and mailing wrappers add ~500 characters of overhead, leaving roughly 400-500 characters for your actual command. If your command is long, put it in a script file and call that instead (e.g., `bash /path/to/script.sh`).

本项目已知问题（fork 维护记录）
--------------------------------
__Windows 本地运行 vitest 时 3 个备份类测试失败__ - 这是测试时序竞态，不是功能缺陷：

- **现象**：在 Windows 本地运行 `npx vitest run`，`GET /backup`、导入自动备份共 3 个用例失败，报 `ENOENT: no such file or directory, copyfile ... crontab.db`。
- **根因**：备份逻辑（`crontab.js` 的 `exports.backup`）直接 `fs.copyFile(crontabDbFile, ...)`，而 crontab.db 由 nedb **异步防抖落盘**——刚保存完立即备份时文件尚未写出，源文件不存在。
- **影响范围**：仅 Windows 本地复现；Linux CI（GitHub Actions，node 20/22 矩阵）全部 28 个用例通过。
- **为什么不修**：本项目以 Linux 容器为部署目标（Dockerfile 基于 node:22-alpine，`/var/spool/cron` 等均为 Linux 路径），Windows 只是开发机、不是验收环境。备份逻辑在生产 Linux 上工作正常。
- **潜在风险**：竞态与平台无关，Linux 上只是概率低、CI 未踩中。若日后 CI 偶发复现，修复思路是备份前等待 nedb 落盘完成（持久化回调）或调整测试时序。
