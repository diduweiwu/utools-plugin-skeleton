/**
 * preload 注入到 window 上的原生能力。
 * 实现见 public/preload/services.js,渲染进程只允许通过 src/platform 封装访问。
 */
declare global {
  interface Window {
    /** 读取文本文件,返回文件内容 */
    readFile(filePath: string): string;
    /** 写入文本文件,返回写入路径 */
    writeFile(filePath: string, content: string): string;
    /** 删除文件(存在才删除) */
    removeFile(filePath: string): void;
    /** 在系统文件管理器中展示文件 */
    showItemInFolder(filePath: string): void;
    /** 使用系统默认浏览器打开超链接 */
    openLink(link: string): void;
  }
}

export {};
