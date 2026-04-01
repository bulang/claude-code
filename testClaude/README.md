# Vue Component Preview Platform

一个在线预览 Vue 组件的项目，支持以组件的形式嵌入到其他项目中。

## 功能特性

- 🎨 左中右三栏弹性布局（文件树 | 编辑器 | 预览区）
- 📁 支持新增/删除文件夹和文件
- 💻 实时编码，即时预览渲染
- 🔍 预览区支持刷新、全屏查看
- 🌓 亮色/暗色主题切换
- 📦 支持配置 CDN 依赖库
- 💾 一键导出项目

## 技术栈

- Vue 3 + TypeScript
- Pinia (状态管理)
- Monaco Editor (代码编辑)
- @vue/repl (Vue 组件渲染)

## 开发

```bash
bun install
bun dev
```

## 构建

```bash
bun build
```

## 变更日志

见 [CHANGELOG.md](./CHANGELOG.md)
