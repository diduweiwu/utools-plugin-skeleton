# utools-plugin-skeleton

基于 **Vue 3 + Vite + TypeScript + Naive UI** 的 uTools 插件开发骨架，开箱即用地解决了 uTools 插件工程化开发中的常见问题（开发热更新、打包产物、API 封装、页面路由、本地持久化），clone 后按「初始化自己的插件」一节改造即可开始业务开发。

## 功能特性

- ⚡ **Vite 开发体验**：开发模式由 uTools 加载 Vite dev server，保存即热更新，无需反复手动构建
- 🔒 **TypeScript 全量类型**：内置 [`utools-api-types`](https://www.npmjs.com/package/utools-api-types)，`utools.*` API 全程类型提示与校验
- 🧩 **分层架构**：`services / stores / composables / views` 职责分离，uTools 环境依赖收敛到唯一出口，可维护、可单测
- 🎨 **Naive UI 按需自动引入**：模板里直接写 `<n-*>` 组件即可，无需手动注册，天然 tree-shaking
- 🌗 **主题系统**：支持 跟随系统 / 浅色 / 深色 三种模式，设置项持久化到 uTools 本地数据库（db）
- 🔀 **多 feature 路由分发**：`plugin.json` 的 feature code 与前端路由解耦映射，关键字进入、选中文字进入（over）都能直达对应页面
- 🌐 **HTTP 封装**：内置统一的 axios 实例（超时、拦截器、错误归一化）

## 技术选型

| 分类 | 技术 | 版本 | 说明 |
| --- | --- | --- | --- |
| 视图框架 | [Vue](https://vuejs.org/) | ^3.5 | 全部使用 `<script setup>` 组合式 API |
| 构建工具 | [Vite](https://vite.dev/) | ^8 | `base: './'` 适配 uTools 的 file 协议加载 |
| 开发语言 | [TypeScript](https://www.typescriptlang.org/) | ~5.9 | 严格模式，`vue-tsc` 负责模板类型检查 |
| UI 组件库 | [Naive UI](https://www.naiveui.com/) | ^2.45 | 按需自动引入（`unplugin-vue-components` + `NaiveUiResolver`） |
| 路由 | [Vue Router](https://router.vuejs.org/) | ^5 | hash 模式（uTools 以 file 协议加载页面，history 模式会 404） |
| 状态管理 | [Pinia](https://pinia.vuejs.org/) | ^4 | 示例 store 演示了设置项 + uTools db 持久化 |
| HTTP | [axios](https://axios-http.com/) | ^1.20 | 统一实例见 `src/services/http.ts` |
| uTools 类型 | [utools-api-types](https://www.npmjs.com/package/utools-api-types) | ^7 | 全局 `utools` 变量的完整类型定义 |

## 目录结构

```text
├── public/                     # 不经 Vite 处理，构建时原样拷贝到 dist/
│   ├── plugin.json             # uTools 插件清单（feature 定义在此）
│   ├── preload.js              # preload 脚本，可使用 Node.js / Electron 能力
│   └── logo.png                # 插件 logo
├── src/
│   ├── main.ts                 # 入口：装配 pinia / router，恢复持久化设置
│   ├── App.vue                 # 根组件：naive-ui 全局 Provider + 布局 + 进入事件分发
│   ├── assets/styles/          # 全局样式（仅重置，颜色交给组件库主题）
│   ├── components/             # 通用组件（AppHeader 等）
│   ├── views/                  # 页面级组件，按业务模块分目录
│   │   ├── home/HomeView.vue
│   │   └── settings/SettingsView.vue
│   ├── router/index.ts         # hash 路由 + feature code → 路由映射表
│   ├── stores/app.ts           # Pinia 全局状态（主题模式、进入信息）
│   ├── composables/            # 组合式函数（useTheme / usePluginEnter）
│   ├── services/
│   │   ├── utools.ts           # uTools API 统一出口（业务代码禁止直接用全局 utools）
│   │   └── http.ts             # axios 统一实例
│   └── types/env.d.ts          # Vite 客户端类型声明
├── index.html                  # Vite 入口 HTML
├── vite.config.ts              # 别名 @ → src、端口 5173、组件自动引入
└── tsconfig.json
```

## 快速开始

### 环境要求

- Node.js ≥ 20.19（推荐 22 LTS）
- [uTools](https://u.tools/) 及其内置的「uTools 开发者工具」插件

### 安装

```bash
npm install
```

### 开发调试

1. 启动开发服务器（热更新）：

   ```bash
   npm run dev
   ```

2. 构建一次产物，让 `dist/` 就绪（`dist/` 是 uTools 开发者工具要引用的插件目录）：

   ```bash
   npm run build
   ```

3. 打开 uTools 的「开发者工具」，新建项目，**项目目录选择 `dist/`**，然后运行插件。

   `dist/plugin.json` 中的 `development.main` 指向 `http://127.0.0.1:5173/`，
   开发者工具会加载 Vite dev server 页面，此后修改 `src/` 代码保存即热更新。

   > 只改前端代码无需重新构建；如果改了 `public/`（如 `plugin.json`、`preload.js`），
   > 需要重新执行 `npm run build`（可另开终端用 `npm run build:watch` 自动重建）。

4. 体验示例功能：uTools 搜索框输入关键字 **demo** / **模板** 进入插件；或选中一段文字后选择「模板示例」进入。

### 打包发布

开发完成后，在 uTools 开发者工具中打开指向 `dist/` 的项目，点击「打包」即可生成发布包。
`plugin.json` 中的 `development` 字段仅在开发模式生效，打包时会被自动忽略。

## 初始化自己的插件

clone 本骨架后，按下面清单替换模板内容：

1. **`package.json`**：修改 `name`、`version` 等元信息；
2. **`public/plugin.json`**：这是 uTools 插件的身份证，必须修改：
   - `pluginName` / `description` / `author`：插件名称、描述、作者；
   - `features`：定义插件入口。`code` 是功能唯一标识，`cmds` 定义触发方式——
     字符串数组表示 uTools 关键字，`{ "type": "over" }` 表示选中文字触发，
     其余类型（`img` / `files` / `regex` / `window`）见[官方文档](https://developer.u-tools.cn/develop/guide/plugin/)；
3. **注册路由**：在 `src/router/index.ts` 的 `FEATURE_ROUTE_MAP` 中，把新的 feature code 指向对应页面路由，并在 `routes` 里新增页面；
4. **替换 logo**：替换 `public/logo.png`（建议 512×512）；
5. **业务开发**：
   - 需要调 uTools 能力（复制、通知、窗口、db 等）→ 在 `src/services/utools.ts` 中补充封装后使用；
   - 需要全局状态 → 在 `src/stores/` 下新增 store；
   - 需要请求外部接口 → 使用 `src/services/http.ts` 导出的实例；
   - 删除或改造示例页面 `src/views/home` / `src/views/settings`，以及 `AppHeader.vue` 中的导航项。

## 分层架构说明

```text
views（页面）
  │  只关心展示与交互
  ▼
composables / stores（逻辑与状态）
  │  组合式函数封装可复用逻辑，store 管理全局状态
  ▼
services（外部能力出口）
  │  utools.ts：uTools API 唯一入口
  │  http.ts：HTTP 请求唯一入口
  ▼
public/preload.js（Node / Electron 能力）
```

- **解耦原则**：`views`、`stores` 不直接访问全局 `utools`，一律经 `src/services/utools.ts`。这样对 uTools 环境的依赖只有一处，单测 mock 该模块即可，未来换运行环境也只改一个文件；
- **事件流**：`App.vue` 通过 `usePluginEnter` 订阅一次插件进入事件 → 写入 store 的 `enterAction` → 按 `FEATURE_ROUTE_MAP` 跳转页面；各页面读 store 即可感知进入信息。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器（127.0.0.1:5173，端口被占用会直接报错） |
| `npm run build` | 类型检查 + 构建产物到 `dist/` |
| `npm run build:watch` | 监听模式构建（修改 `public/` 后自动重建） |
| `npm run typecheck` | 仅执行 `vue-tsc` 类型检查 |
| `npm run preview` | 本地预览构建产物 |

## 常见问题

**为什么用 hash 路由？**
uTools 以 file 协议加载 `dist/index.html`，history 路由在刷新或直接访问子路径时会 404，必须使用 hash 模式。

**为什么 dev server 固定绑定 127.0.0.1？**
`plugin.json` 的 `development.main` 写死了 `http://127.0.0.1:5173/`；Vite 默认监听的 `localhost` 在部分系统只解析到 IPv6，会导致 uTools 加载失败，因此 `vite.config.ts` 显式绑定 IPv4 并开启 `strictPort`。

**能在浏览器里直接调试吗？**
可以。`npm run dev` 后直接访问 <http://127.0.0.1:5173/>，`services/utools.ts` 检测到非 uTools 环境会自动降级为 no-op，页面可正常渲染（uTools 相关能力不生效）。

## LICENSE

[MIT](./LICENSE)
