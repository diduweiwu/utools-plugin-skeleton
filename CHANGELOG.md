# Changelog

本文件是插件对外发布的更新日志，`ztools publish` 会校验当前版本对应的
`## 版本号 - YYYY-MM-DD` 小节是否存在（格式严格，正文不能为空），
并把该小节内容自动注入发布 PR 描述。

发新版本时：更新 `public/plugin.json` 的 `version`，然后在文件顶部按同样格式追加小节。
更早的历史日志见 README「更新日志」。

## 1.0.0 - 2026-09-21

1.工程现代化：升级 Vite 8 / TypeScript 5.9 / vue-tsc 3 / ESLint 10，开启 TS strict 全量检查
2.逻辑层(composables/sources/platform/utils)由 .js + JSDoc 全面迁移为 .ts，图源接口响应补充类型
3.所有组件迁移为 script setup + TypeScript；naive-ui 组件改由 unplugin-vue-components 按需自动注册
4.vue API 由 unplugin-auto-import 自动导入；新增 @ 路径别名
5.新增 ESLint(flat config) + Prettier + EditorConfig + Vitest 单元测试 + GitHub Actions CI
6.目录按领域重组：页面拆到 views/，组件按 emoticon/source/star/more/donate 分目录并更名
7.修复关于页收款码图片使用 /src 绝对路径导致打包后 404 的问题
8.check:sources 脚本迁移为 TypeScript(经 tsx 运行)，与插件共享同一套类型化源码
9.收藏列表 computed 移除副作用，缺失文件补下载统一收敛到收藏夹打开/收藏动作
10.插件标识通用化：插件 name 由 doutu 改为 plugin-skeleton，便于作为脚手架复用，使用者按 README「改成你自己的插件」自行命名
11.移除表情包示例业务（图源/收藏/下载/赞助等），HomeView 与 preload 换成覆盖生命周期/副输入框/存储/通知/剪贴板/文件读写的通用示例，依赖精简（移除 axios/cheerio/tsx）
12.默认图标替换为通用「插件拼图块」设计（512×512，源文件 logo.svg 随仓库提供，可自行改色后重新导出）
13.新增 npm run create 交互式生成器：询问插件信息后在新目录产出一套替换好标识的原始插件源码，含 git 初始化与精简 README/CHANGELOG
14.双平台适配升级为 CI 硬约束：新增平台对齐校验用例（清单双平台必需字段/preload 零第三方依赖/双全局识别），文档补齐 uTools 开发与发布路径，preload 内置模块统一 node: 前缀
