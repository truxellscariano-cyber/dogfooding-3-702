# 3D 太阳系模拟器

一个使用 Three.js 构建的交互式 3D 太阳系模拟器。

## 功能特性

- 🌞 **太阳**：中心位置，自发光效果
- 🌍 **地球**：围绕太阳公转，包含月球
- 🌙 **月球**：围绕地球公转
- 🔴 **火星**：红色星球
- 🟠 **木星**：太阳系最大的行星
- 🟡 **水星**：最小且离太阳最近
- 🟤 **金星**：最热的行星

## 交互功能

- **鼠标拖拽**：旋转视角
- **鼠标滚轮**：缩放场景
- **点击天体**：显示天体名称和基本信息

## 技术栈

- Three.js 0.160.0
- Vite 5.0.0
- JavaScript (ES6+)

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

然后在浏览器中打开显示的地址（通常是 http://localhost:5173）。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
.
├── index.html          # 主 HTML 文件
├── main.js            # 主要 JavaScript 代码
├── package.json       # 项目配置文件
└── README.md          # 本文件
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari

## 许可证

MIT
