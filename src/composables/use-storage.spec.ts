import { afterEach, describe, expect, it } from "vitest";

import { getPlatformName, isPlatformReady } from "@/platform";
import { loadJsonStorage, saveJsonStorage } from "@/composables/use-storage";

/**
 * 平台全局对象是运行时由 preload 注入的,单测里手工在 globalThis 上
 * 挂载最小 API 形状来模拟注入,用完即清理,避免用例间相互污染。
 */

type PlatformGlobal = "ztools" | "utools";

const makeApi = () => ({
  dbStorage: {
    store: new Map<string, unknown>(),
    getItem(key: string) {
      return this.store.get(key);
    },
    setItem(key: string, value: unknown) {
      this.store.set(key, value);
    },
  },
});

const injectPlatform = (name: PlatformGlobal): void => {
  (globalThis as Record<string, unknown>)[name] = makeApi();
};

const clearPlatforms = (): void => {
  delete (globalThis as Record<string, unknown>).ztools;
  delete (globalThis as Record<string, unknown>).utools;
};

afterEach(clearPlatforms);

describe("平台识别", () => {
  it("未注入任何平台全局时返回 null 且视为未就绪", () => {
    clearPlatforms();
    expect(getPlatformName()).toBeNull();
    expect(isPlatformReady()).toBe(false);
  });

  it("注入 ztools 全局后识别为 ztools", () => {
    injectPlatform("ztools");
    expect(getPlatformName()).toBe("ztools");
    expect(isPlatformReady()).toBe(true);
  });

  it("注入 utools 全局后识别为 utools", () => {
    injectPlatform("utools");
    expect(getPlatformName()).toBe("utools");
    expect(isPlatformReady()).toBe(true);
  });

  it("两个全局同时存在时优先 ztools", () => {
    injectPlatform("utools");
    injectPlatform("ztools");
    expect(getPlatformName()).toBe("ztools");
  });
});

describe("dbStorage JSON 封装", () => {
  it("平台未就绪时 loadJsonStorage 返回空对象兜底", () => {
    clearPlatforms();
    expect(loadJsonStorage<{ counter: number }>("demo").counter).toBeUndefined();
  });

  it("saveJsonStorage 写入后可经 loadJsonStorage 读回", () => {
    injectPlatform("ztools");
    saveJsonStorage("demo", { counter: 3, note: "你好" });
    expect(loadJsonStorage<{ counter: number; note: string }>("demo")).toEqual({
      counter: 3,
      note: "你好",
    });
  });

  it("存储内容损坏时返回空对象而不抛错", () => {
    const api = makeApi();
    (globalThis as Record<string, unknown>).ztools = api;
    api.dbStorage.store.set("broken", "not-json");
    expect(loadJsonStorage("broken")).toEqual({});
  });
});
