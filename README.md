# utools-plugin-skeleton

uTools / ZTools 双平台通用插件脚手架,基于 Vue 3 + TypeScript + Vite + naive-ui。

两个平台的插件规范基本一致(`plugin.json` + `preload` + 渲染页面,仅全局 API 对象名不同),
本仓库用**一套源码**同时适配:平台桥接层统一识别、preload 双平台兼容、清单字段两边通用,
开发、构建、发布的完整链路均已按官方文档打通。

## 快速开始

要求 Node.js `^20.19.0 || >=22.12.0`。

```bash
npm install            # 安装依赖
npm run create         # 交互式生成一套新插件源码到指定目录(见下文)
npm run dev            # 本地开发(vite dev server,配合 uTools/ZTools 开发模式)
npm run build          # 类型检查 + 打包到 dist/(即完整插件目录)
npm run lint           # ESLint 检查
npm run format         # Prettier 格式化
npm run test           # Vitest 单元测试
npm run ztools:publish # 发布到 ZTools 插件市场(见下文)
```

工程约定:

- **全量 TypeScript strict 模式**,业务代码与组件均为 `.ts` / `<script setup lang="ts">`;
- **ESLint(flat config) + Prettier** 负责代码质量与格式,提交前跑 `npm run lint`;
- `vue` API(`ref`/`computed` 等)由 `unplugin-auto-import` 自动导入,
  naive-ui 组件由 `unplugin-vue-components` 按需自动注册,无需手动 import/安装;
- 路径别名 `@` 指向 `src/`;
- 单元测试文件与被测模块同目录,命名为 `*.spec.ts`;
- 对外发版的更新日志写在 `CHANGELOG.md`(严格 `## 版本号 - YYYY-MM-DD` 格式,`ztools publish` 发布时强制校验);
- 推送/PR 时 GitHub Actions 自动执行 lint → 类型检查 → 测试 → 构建。

## 目录结构

```text
src/
├── main.ts                     # 应用入口(naive-ui 组件自动按需注册)
├── App.vue                     # 应用外壳:跟随系统主题 + 全局消息容器
├── styles/main.css             # 全局样式(含明暗两套背景)
├── types/                      # 自动生成的组件/API 声明(unplugin 维护,勿手改)
├── platform/                   # 平台桥接层
│   ├── index.ts                # 全项目唯一触碰平台 API 的地方,同一套代码适配 uTools/Ztools
│   └── window.d.ts             # preload 注入到 window 的能力声明
├── composables/
│   └── use-storage.ts          # dbStorage JSON 读写封装(平台未就绪时安全兜底)
└── views/
    └── HomeView.vue            # 通用示例页(见下文「示例页演示了什么」)

public/                         # 插件根目录,构建时原样拷贝进 dist/
├── plugin.json                 # 插件清单(uTools/ZTools 双平台通用字段 + 官方 $schema)
├── logo.png
└── preload/
    ├── package.json            # 固定 CommonJS
    └── services.js             # preload 示例:直接 require node 内置模块,挂载 window 能力
```

> 注意:`src/`(前端源码)与 `public/`(插件清单/preload)各司其职,前者经 Vite 编译、
> 后者原样拷贝,共同组成 `dist/` 这一个插件目录——项目里只有这一套插件根目录约定。

## 示例页演示了什么

`src/views/HomeView.vue` 是接入自己业务的起点,覆盖了脚手架接好的全部平台能力:

- **平台识别**:当前运行在 ztools / uTools / 未注入(浏览器模拟);
- **生命周期**:`onPluginEnter`(关键词与 over 选中文字两种触发,payload 展示)、`onPluginOut`;
- **副输入框**:`setSubInput` 内容实时回显;
- **持久化**:`dbStorage` 经 `use-storage` 封装读写,退出重进不丢;
- **系统能力**:系统通知、复制到剪贴板;
- **preload Node 能力**:读写用户数据目录下的文本文件、在文件管理器中定位。

## 平台支持

同一套代码同时适配 **uTools** 与 **ztools**:

- 平台 API 在 `src/platform/index.ts` 统一识别(`utools` / `ztools` 全局),preload 同样做了双平台兼容;
- `public/plugin.json` 同时包含两个平台的清单字段(pluginName / name、title 等),关键字两边通用;
- 插件标识是通用占位名(`plugin-skeleton`),改成自己的名字见下文;
- 双平台是硬性约定:`scripts/platform-parity.spec.mjs` 在 CI 中持续校验清单双平台必需字段、
  preload 零第三方依赖、桥接层/preload 双全局识别,任何一侧缺失都会导致测试失败。

## 开发调试与发布(uTools / ZTools)

对照 [ZTools 官方开发文档](https://github.com/ZToolsCenter/ZTools-doc)接入,两个平台的插件规范基本一致,以下均已打通:

**类型提示** —— `@ztools-center/ztools-api-types` 同时提供 API 类型与清单校验:
tsconfig `types` 引入全局 `ZToolsApi` 与 `ztools` 声明;`public/plugin.json` 的 `$schema`
指向包内 `ztools.schema.json`,编辑器可对清单字段做校验与悬浮提示。

**开发调试** —— `npm run dev` 启动 Vite(端口 5173)后:

- **ZTools**:开发者工具里添加开发项目并选择 `public/plugin.json`;
- **uTools**:开发者工具里新建项目选择 `public/plugin.json`,二者等价。

两个平台都会经 `development.main` 以 `http://localhost:5173` 加载页面,保存即热更新;
preload 始终走 `public/preload/services.js`,改它需要在各自开发者工具里「重载插件」。

**构建产物** —— `npm run build` 输出的 `dist/` 就是完整的插件应用目录
(`index.html` + `assets/` + `plugin.json` + `preload/` + `logo.png`),直接拿这个文件夹
安装/分发即可;注意不要把整个项目根目录打包进去。`base: './'` 相对路径已适配宿主的 `file://` 加载。

**发布到插件市场** —— 两个平台各自的通道:

- **ZTools 市场**:`npm run ztools:publish`(官方 [@ztools-center/plugin-cli](https://github.com/ZToolsCenter/ztools-plugin-cli)):
  1. CLI 自动识别本项目的 `public/plugin.json`(官方三种支持位置之一,本项目只用这一种,不存在两套目录);
  2. 前置校验:git 工作区必须干净,且 `CHANGELOG.md` 存在当前版本的 `## 版本号 - YYYY-MM-DD` 小节(格式严格);
  3. 首次发布走 GitHub OAuth 授权,CLI 自动 fork `ZToolsCenter/ZTools-plugins`、以源码形式同步并创建 Draft PR(自动排除 node_modules/dist);
  4. 发布后手动完成三件事才会进入审核:PR 里附截图/演示 GIF、勾选自检清单、切到 Ready for review。
- **uTools 市场**:`npm run build` 后,在 uTools 开发者后台创建插件应用,用 `dist/` 目录打包并提交审核(流程以 uTools 官方开发者文档为准)。

## 一键生成新插件

不用手动复制改名,在本脚手架目录里运行:

```bash
npm run create                    # 交互式询问,生成到指定目录
npm run create -- my-plugin       # 直接指定目标目录,其余信息仍会询问
```

生成器会依次询问 目标目录 / 插件唯一 ID / 展示名称 / 描述 / 作者 / 版本号 / 首个功能触发词,
然后把脚手架复制到新目录(自动排除 node_modules、dist、.git),并完成所有标识替换:

- `package.json` 的 `name` / `description` / `version`;
- `public/plugin.json` 的 `name` / `pluginName` / `title` / `description` / `author` / `version`,
  提供了触发词时同步替换首个功能的 `cmds`;
- `index.html` 的 `<title>`;`README.md` 与 `CHANGELOG.md` 生成为新项目的精简版
  (CHANGELOG 自带满足 `ztools publish` 校验的版本小节)。

最后自动 `git init` 并创建初始提交,新目录里 `npm install` 后即可直接开发;
开发调试与发布步骤与脚手架完全一致,见上文工作流。

## 改成你自己的插件

> 下面的手动改名流程已由 `npm run create` 自动完成,仅供手动维护时参照。

仓库内的插件标识是通用的占位名(`plugin-skeleton`),基于它开发自己的插件时,把以下字段改成你自己的信息即可:

| 文件                           | 字段                                 | 说明                                                                            |
| ------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------- |
| `public/plugin.json`           | `name`                               | 插件唯一 ID,同时也是 ZTools 市场目录名,发布后不可变更                           |
| `public/plugin.json`           | `pluginName` / `title`               | 插件展示名称                                                                    |
| `public/plugin.json`           | `description` / `author` / `version` | 描述、作者、版本号                                                              |
| `public/plugin.json`           | `features[].code` / `cmds`           | 功能标识与触发词,按你的功能语义修改                                             |
| `package.json`                 | `name` / `description`               | npm 包名,建议与插件 ID 保持一致                                                 |
| `index.html`                   | `<title>`                            | 页面标题                                                                        |
| `logo.svg` / `public/logo.png` | 整个文件                             | 默认图标:改 `logo.svg` 的配色/造型后重新导出 512×512 PNG 覆盖 `public/logo.png` |

`src/views/HomeView.vue` 与 `public/preload/services.js` 是两段通用示例,可以直接改写成你的业务;
平台桥接层 `src/platform/` 与清单结构保持原样即可,新增平台 API 时在桥接层补对应封装。

## 更新日志

见 [CHANGELOG.md](CHANGELOG.md)。
