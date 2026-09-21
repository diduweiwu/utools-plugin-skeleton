const fs = require('fs')

// 同一套 preload 同时服务 uTools 与 ztools,运行时识别平台全局对象
const getApi = () => globalThis.ztools ?? globalThis.utools

/**
 * 读取文本文件
 * @param filePath
 * @returns {string} 文件内容
 */
window.readFile = (filePath) => fs.readFileSync(filePath, 'utf-8')

/**
 * 写入文本文件
 * @param filePath
 * @param content
 * @returns {string} 写入的文件路径
 */
window.writeFile = (filePath, content) => {
  fs.writeFileSync(filePath, content, 'utf-8')
  return filePath
}

/**
 * 删除文件(存在才删除)
 * @param filePath
 */
window.removeFile = (filePath) => fs.existsSync(filePath) && fs.unlinkSync(filePath)

/**
 * 在系统文件管理器中展示文件
 * @param filePath
 */
window.showItemInFolder = (filePath) => getApi().shellShowItemInFolder(filePath)

/**
 * 使用系统默认浏览器打开超链接
 * @param link
 */
window.openLink = (link) => getApi().shellOpenExternal(link)
