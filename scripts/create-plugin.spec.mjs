import { describe, expect, it } from "vitest";

import {
  fillIndexHtml,
  fillPackageJson,
  fillPluginManifest,
  isValidPluginId,
  isValidVersion,
  parseCmds,
  renderChangelog,
  renderReadme,
  shouldSkipForCopy,
} from "./create-plugin.mjs";

describe("输入校验", () => {
  it("插件 ID:接受小写字母开头的字母数字连字符组合", () => {
    expect(isValidPluginId("my-plugin")).toBe(true);
    expect(isValidPluginId("a1")).toBe(true);
    expect(isValidPluginId("Plugin")).toBe(false);
    expect(isValidPluginId("1abc")).toBe(false);
    expect(isValidPluginId("has space")).toBe(false);
    expect(isValidPluginId("")).toBe(false);
  });

  it("版本号:仅接受 x.y.z 数字格式", () => {
    expect(isValidVersion("0.0.1")).toBe(true);
    expect(isValidVersion("1.20.3")).toBe(true);
    expect(isValidVersion("v1.0.0")).toBe(false);
    expect(isValidVersion("1.0")).toBe(false);
  });

  it("触发词:支持中英文逗号分隔并去除空项", () => {
    expect(parseCmds("天气, weather，查天气")).toEqual(["天气", "weather", "查天气"]);
    expect(parseCmds("  ")).toEqual([]);
  });
});

describe("标识替换", () => {
  const manifest = {
    name: "plugin-skeleton",
    pluginName: "插件骨架",
    title: "插件骨架",
    description: "脚手架描述",
    author: "someone",
    version: "1.0.0",
    features: [
      { code: "hello", explain: "示例", icon: "logo.png", cmds: ["hello", "你好"] },
      { code: "over-demo", explain: "示例2", cmds: [{ type: "over", label: "处理选中文本" }] },
    ],
  };

  it("fillPluginManifest 替换标识字段且不改动入参", () => {
    const next = fillPluginManifest(manifest, {
      id: "my-plugin",
      title: "我的插件",
      description: "描述",
      author: "作者",
      version: "0.1.0",
    });
    expect(next.name).toBe("my-plugin");
    expect(next.pluginName).toBe("我的插件");
    expect(next.title).toBe("我的插件");
    expect(next.version).toBe("0.1.0");
    // 未提供触发词时 features 原样保留
    expect(next.features[0].cmds).toEqual(["hello", "你好"]);
    expect(next.features[1]).toEqual(manifest.features[1]);
    // 入参对象未被污染
    expect(manifest.name).toBe("plugin-skeleton");
  });

  it("fillPluginManifest 提供触发词时仅替换首个 feature 的 cmds", () => {
    const next = fillPluginManifest(manifest, {
      id: "my-plugin",
      title: "我的插件",
      description: "",
      author: "",
      version: "0.1.0",
      cmds: ["天气"],
    });
    expect(next.features[0].cmds).toEqual(["天气"]);
    expect(next.features[0].code).toBe("hello");
    expect(next.features[1].cmds).toEqual([{ type: "over", label: "处理选中文本" }]);
  });

  it("fillPackageJson 替换 name/version/description", () => {
    const next = fillPackageJson(
      { name: "plugin-skeleton", version: "1.0.0", description: "脚手架", scripts: {} },
      {
        id: "my-plugin",
        version: "0.1.0",
        description: "",
      },
    );
    expect(next).toEqual({ name: "my-plugin", version: "0.1.0", description: "脚手架", scripts: {} });
  });

  it("fillIndexHtml 替换页面标题", () => {
    expect(fillIndexHtml("<!doctype html><title>插件骨架</title>", "我的插件")).toBe(
      "<!doctype html><title>我的插件</title>",
    );
  });
});

describe("生成产物", () => {
  it("README 包含标题与快速开始命令", () => {
    const readme = renderReadme({ title: "我的插件", description: "测试描述" });
    expect(readme).toContain("# 我的插件");
    expect(readme).toContain("测试描述");
    expect(readme).toContain("npm run dev");
  });

  it("CHANGELOG 含满足 ztools publish 严格格式的版本小节", () => {
    const changelog = renderChangelog({ version: "0.1.0", date: "2026-09-21" });
    expect(changelog).toMatch(/^## 0\.1\.0 - \d{4}-\d{2}-\d{2}$/m);
    expect(changelog).toContain("初始版本");
  });

  it("复制排除规则:跳过 node_modules/dist/.git/.DS_Store", () => {
    for (const skipped of ["/x/node_modules", "/x/dist", "/x/.git", "/x/.DS_Store"]) {
      expect(shouldSkipForCopy(skipped)).toBe(true);
    }
    expect(shouldSkipForCopy("/x/src")).toBe(false);
    expect(shouldSkipForCopy("/x/package.json")).toBe(false);
  });
});
