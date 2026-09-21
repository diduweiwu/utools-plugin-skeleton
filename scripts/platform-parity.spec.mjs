/**
 * 双平台适配不变量校验(uTools + ZTools)。
 *
 * 脚手架与生成的项目都必须同时服务两个平台,这里把「双平台」从口头约定
 * 变成 CI 可执行的断言:清单字段、preload 能力、桥接层全局识别,任何一侧
 * 的必需项缺失都会在 lint/test 阶段直接失败。
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(path.join(root, "public/plugin.json"), "utf8"));
const preloadSource = readFileSync(path.join(root, "public/preload/services.js"), "utf8");
const platformSource = readFileSync(path.join(root, "src/platform/index.ts"), "utf8");

describe("双平台适配不变量(uTools + ZTools)", () => {
  it("清单同时包含两个平台的必需字段", () => {
    // uTools 必需:pluginName(展示名);$schema 面向 ZTools/编辑器,uTools 侧忽略
    expect(manifest.pluginName).toBeTruthy();
    expect(manifest.$schema).toBeTruthy();
    // 双平台必需
    for (const key of ["name", "title", "main", "preload", "logo", "version"]) {
      expect(manifest[key], `缺少字段 ${key}`).toBeTruthy();
    }
    expect(Array.isArray(manifest.features)).toBe(true);
    expect(manifest.features.length).toBeGreaterThan(0);
  });

  it("开发模式入口指向本地 dev server(两个平台的开发者模式共用)", () => {
    expect(manifest.development?.main).toMatch(/^http:\/\/localhost:\d+/);
  });

  it("preload 与平台桥接层同时识别 ztools / utools 全局", () => {
    for (const source of [preloadSource, platformSource]) {
      expect(source).toContain("ztools");
      expect(source).toContain("utools");
    }
  });

  it("preload 保持零第三方依赖(内置模块统一 node: 前缀,满足双平台源码可读要求)", () => {
    const requires = [...preloadSource.matchAll(/require\(["']([^"']+)["']\)/g)].map((m) => m[1]);
    expect(requires.length).toBeGreaterThan(0);
    for (const moduleName of requires) {
      expect(moduleName.startsWith("node:"), `非内置模块: ${moduleName}`).toBe(true);
    }
  });
});
