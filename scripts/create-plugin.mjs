/**
 * 插件脚手架生成器 —— 运行 `npm run create` 在任意新目录产出一套原始插件源码。
 *
 * 流程:交互式询问插件信息 → 复制脚手架(排除 node_modules/dist/.git 等) →
 * 把清单/包描述/页面标题等标识字段替换为用户输入 → 初始化 git 仓库。
 * 纯逻辑(校验与替换函数)导出供单测复用,见 scripts/create-plugin.spec.mjs。
 */
import { cpSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

/** 脚手架自身根目录(脚本位于 <root>/scripts/) */
const SCAFFOLD_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ==================== 纯逻辑(供生成与单测复用) ====================

/** 插件唯一 ID:小写字母开头,仅小写字母/数字/连字符(同时是 ZTools 市场目录名) */
export const isValidPluginId = (value) => /^[a-z][a-z0-9-]*$/.test(value);

/** 版本号:x.y.z 数字形式 */
export const isValidVersion = (value) => /^\d+\.\d+\.\d+$/.test(value);

/** 触发词输入:中英文逗号分隔,去除空项 */
export const parseCmds = (raw) =>
  raw
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);

/** 替换 package.json 的插件标识字段(返回新对象,不改动入参) */
export function fillPackageJson(pkg, { id, description, version }) {
  return { ...pkg, name: id, version, description: description || pkg.description };
}

/**
 * 替换 plugin.json 的插件标识字段。
 * cmds(可选)会替换首个 feature 的触发词,其余 feature 保持脚手架示例原样。
 */
export function fillPluginManifest(manifest, { id, title, description, author, version, cmds }) {
  const next = structuredClone(manifest);
  next.name = id;
  next.pluginName = title;
  next.title = title;
  next.description = description;
  next.author = author;
  next.version = version;
  if (cmds?.length && Array.isArray(next.features) && next.features[0]) {
    next.features[0] = { ...next.features[0], cmds };
  }
  return next;
}

/** 替换 index.html 的 <title> */
export const fillIndexHtml = (html, title) =>
  html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);

/** 生成的项目 README:只保留上手必需内容,规范细节指向脚手架仓库 */
export function renderReadme({ title, description }) {
  return `# ${title}

${description || "uTools / ZTools 双平台插件。"}

基于 [utools-plugin-skeleton](https://github.com/diduweiwu/utools-plugin-skeleton) 脚手架生成,
一套源码同时适配 uTools 与 ZTools,平台桥接/构建/发布链路均已打通。

## 快速开始

要求 Node.js \`^20.19.0 || >=22.12.0\`。

\`\`\`bash
npm install   # 安装依赖
npm run dev   # 本地开发,配合 uTools/ZTools 开发者模式加载 public/plugin.json
npm run build # 打包到 dist/(即完整插件目录)
\`\`\`

## 定制指引

- 功能与触发词: \`public/plugin.json\` 的 \`features\` 字段;
- 页面逻辑: \`src/views/HomeView.vue\`(通用示例,含生命周期/存储/preload 等全部能力演示);
- 原生能力: \`public/preload/services.js\`(CommonJS 直引 Node 内置模块,不可打包混淆);
- 双平台适配: \`src/platform/\` 桥接层与 preload 均同时识别 uTools/ZTools,无需分叉代码。

## 开发与发布(uTools / ZTools 双平台)

- **开发调试**: \`npm run dev\` 后,uTools 开发者工具或 ZTools 开发者工具添加
  \`public/plugin.json\` 即可,两个平台都会经 \`development.main\` 热更新加载;
- **发布 ZTools 市场**: \`npm run ztools:publish\`(CHANGELOG 已按校验格式生成);
- **发布 uTools 市场**: \`npm run build\` 后用 dist 目录在 uTools 开发者后台打包提审。

更多平台桥接与工作流细节见脚手架仓库 README。
`;
}

/** 生成的项目 CHANGELOG:满足 ztools publish 的严格小节格式 */
export function renderChangelog({ version, date }) {
  return `# Changelog

本文件是插件对外发布的更新日志,\`ztools publish\` 会校验当前版本对应的
\`## 版本号 - YYYY-MM-DD\` 小节(格式严格,正文不能为空)。

## ${version} - ${date}

- 初始版本,基于 utools-plugin-skeleton 脚手架生成
`;
}

/** 复制脚手架时的排除规则 */
export function shouldSkipForCopy(srcPath) {
  const base = path.basename(srcPath);
  return base === "node_modules" || base === "dist" || base === ".git" || base === ".DS_Store";
}

// ==================== 交互与生成流程 ====================

async function ask(rl, question, { defaultValue = "", validate } = {}) {
  const suffix = defaultValue ? `(${defaultValue})` : "";
  for (;;) {
    const raw = ((await rl.question(`${question}${suffix}: `)) || "").trim();
    const value = raw || defaultValue;
    const error = validate?.(value);
    if (!error) {
      return value;
    }
    console.log(`  ✗ ${error}`);
  }
}

/**
 * 创建提问器:输入流提前结束(管道喂行不足 / Ctrl+D)时,
 * 未决的提问会以明确错误中断,而不是永远挂起或静默退出。
 */
function createPrompter() {
  const rl = createInterface({ input: stdin, output: stdout });
  const closed = new Promise((_, reject) =>
    rl.on("close", () => reject(new Error("输入流已结束,生成已取消"))),
  );
  return {
    question: (text) => Promise.race([rl.question(text), closed]),
    close: () => rl.close(),
  };
}

/** 目标目录:不存在或为空目录才可用 */
function assertTargetAvailable(target) {
  if (!existsSync(target)) {
    return;
  }
  if (!statSync(target).isDirectory()) {
    throw new Error(`目标路径 ${target} 已存在且不是目录`);
  }
  if (readdirSync(target).length > 0) {
    throw new Error(`目标目录 ${target} 非空,请换一个目录名`);
  }
}

function generateProject(target, answers) {
  const { id, title, description, author, version, cmds } = answers;
  cpSync(SCAFFOLD_ROOT, target, { recursive: true, filter: (src) => !shouldSkipForCopy(src) });

  const writeFile = (relative, content) => writeFileSync(path.join(target, relative), content);
  const readJson = (relative) => JSON.parse(readFileSync(path.join(target, relative), "utf8"));

  writeFile(
    "package.json",
    `${JSON.stringify(fillPackageJson(readJson("package.json"), { id, description, version }), null, 2)}\n`,
  );
  writeFile(
    "public/plugin.json",
    `${JSON.stringify(fillPluginManifest(readJson("public/plugin.json"), { id, title, description, author, version, cmds }), null, 2)}\n`,
  );
  writeFile("index.html", fillIndexHtml(readFileSync(path.join(target, "index.html"), "utf8"), title));
  writeFile("README.md", renderReadme({ title, description }));
  writeFile("CHANGELOG.md", renderChangelog({ version, date: new Date().toISOString().slice(0, 10) }));
}

function initGitRepo(target) {
  try {
    execSync("git init -q", { cwd: target, stdio: "ignore" });
    execSync("git add -A", { cwd: target, stdio: "ignore" });
    execSync('git commit -qm "初始提交:基于 utools-plugin-skeleton 生成"', { cwd: target, stdio: "ignore" });
    return true;
  } catch {
    console.log("  (git 仓库初始化未完成,可稍后手动执行 git init 并提交)");
    return false;
  }
}

async function main() {
  const prompter = createPrompter();
  const askLine = (question, options) => ask(prompter, question, options);
  console.log("插件脚手架生成器 —— 直接回车使用括号内的默认值,Ctrl+C 退出\n");

  const targetInput = await askLine("目标目录名(插件将生成到这个新目录)");
  const target = path.resolve(process.cwd(), targetInput);
  assertTargetAvailable(target);

  const answers = {
    id: await askLine("插件唯一 ID(name,小写字母/数字/连字符)", {
      defaultValue: path.basename(target),
      validate: (value) =>
        isValidPluginId(value) ? undefined : "需以小写字母开头,仅含小写字母、数字、连字符",
    }),
    title: "",
    description: "",
    author: "",
    version: "",
    cmds: [],
  };
  answers.title = await askLine("插件展示名称(title)", {
    defaultValue: answers.id,
    validate: (value) => (value ? undefined : "展示名称不能为空"),
  });
  answers.description = await askLine("插件描述", { defaultValue: "uTools / ZTools 双平台插件。" });
  answers.author = await askLine("作者", { defaultValue: "" });
  answers.version = await askLine("版本号", {
    defaultValue: "0.0.1",
    validate: (value) => (isValidVersion(value) ? undefined : "需为 x.y.z 数字格式,如 0.0.1"),
  });
  answers.cmds = parseCmds(
    await askLine("首个功能触发词(逗号分隔,留空保留示例 hello/你好)", { defaultValue: "" }),
  );
  prompter.close();

  console.log(`\n正在生成到 ${target} ...`);
  generateProject(target, answers);
  const gitReady = initGitRepo(target);

  console.log(`
✓ 插件源码已生成:${target}

接下来:
  cd ${path.relative(process.cwd(), target) || "."}
  npm install
  npm run dev        # 开发调试(ZTools/uTools 开发者模式指向 public/plugin.json)

发布到 ZTools 市场前确认 plugin.json 的功能与触发词,然后执行:
  npm run ztools:publish
${gitReady ? "(已自动 git init 并创建初始提交,ztools publish 可直接使用)" : ""}`);
}

/** 仅在直接执行本脚本时运行(npm run create),被测试导入时不触发 */
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().catch((error) => {
    console.error(`\n✗ ${error instanceof Error ? error.message : "生成已取消"}`);
    process.exitCode = 1;
  });
}
