# Word 文档 ↔ Markdown 双向转换工具

## 📖 项目简介

这是一个基于 NestJS + Vue 3 的 Word 文档与 Markdown 双向转换工具，支持在线编辑、实时预览和格式保留。

### 核心功能

- 📤 **docx → Markdown**: 上传 Word 文档，自动转换为 Markdown 格式
- ✏️ **在线编辑**: 实时编辑 Markdown 文本
- 👁️ **实时预览**: 查看 Markdown 渲染效果
- 📥 **Markdown → docx**: 将编辑后的 Markdown 转回 Word 文档
- 💾 **多格式下载**: 支持下载 .md 和 .docx 两种格式
- 🎨 **格式保留**: 保留标题、粗体、斜体、列表、表格等格式

## 🛠️ 技术栈

### 后端技术

#### 框架
- **NestJS** `^10.0.0`
  - TypeScript 后端框架
  - 提供模块化架构和依赖注入
  - 官网: https://nestjs.com/

#### 核心依赖

##### 1. mammoth `^1.8.0`
- **用途**: 将 docx 文件转换为 HTML
- **功能**: 
  - 解析 Word 文档的 XML 结构
  - 转换为干净的 HTML
  - 支持自定义样式映射
- **官网**: https://github.com/mwilliamson/mammoth.js
- **使用场景**: docx → HTML 的第一步转换

```typescript
import * as mammoth from 'mammoth';

const result = await mammoth.convertToHtml(
  { path: filePath },
  {
    styleMap: [
      "p[style-name='Heading 1'] => h1:fresh",
      // ... 更多样式映射
    ],
    includeDefaultStyleMap: true,
  }
);
```

##### 2. turndown `^7.2.0`
- **用途**: 将 HTML 转换为 Markdown
- **功能**:
  - 支持自定义转换规则
  - 可配置的 Markdown 风格
  - 处理各种 HTML 标签
- **官网**: https://github.com/mixmark-io/turndown
- **使用场景**: HTML → Markdown 的第二步转换

```typescript
import * as TurndownService from 'turndown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  strongDelimiter: '**',
  emDelimiter: '*',
});
```

##### 3. turndown-plugin-gfm `^1.0.2`
- **用途**: Turndown 的 GitHub Flavored Markdown 插件
- **功能**:
  - 支持表格转换
  - 支持删除线
  - 支持任务列表
- **官网**: https://github.com/mixmark-io/turndown-plugin-gfm
- **使用场景**: 增强 Markdown 功能，特别是表格支持

```typescript
import { gfm } from 'turndown-plugin-gfm';

turndownService.use(gfm);
```

##### 4. markdown-it `^14.1.0`
- **用途**: 解析 Markdown 为 tokens
- **功能**:
  - 快速的 Markdown 解析器
  - 支持插件扩展
  - 支持 HTML 标签
- **官网**: https://github.com/markdown-it/markdown-it
- **使用场景**: Markdown → docx 的解析阶段

```typescript
import * as MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true, // 启用 HTML 标签支持
});
const tokens = md.parse(markdown, {});
```

##### 5. docx `^8.5.0`
- **用途**: 生成 Word 文档
- **功能**:
  - 创建 .docx 文件
  - 支持段落、标题、表格等
  - 支持文本格式（粗体、斜体等）
- **官网**: https://docx.js.org/
- **使用场景**: Markdown → docx 的生成阶段

```typescript
import { Document, Packer, Paragraph, TextRun } from 'docx';

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({
        text: '标题',
        heading: HeadingLevel.HEADING_1,
      }),
    ],
  }],
});

const buffer = await Packer.toBuffer(doc);
```

##### 6. multer `^2.0.2`
- **用途**: 处理文件上传
- **功能**:
  - multipart/form-data 解析
  - 文件存储管理
  - 文件大小限制
- **官网**: https://github.com/expressjs/multer
- **使用场景**: 接收前端上传的 docx 文件

```typescript
import { diskStorage } from 'multer';

@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/docx',
      filename: (req, file, callback) => {
        // 自定义文件名
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  })
)
```

### 前端技术

#### 框架
- **Vue 3** `^3.5.26`
  - 渐进式 JavaScript 框架
  - Composition API
  - 官网: https://vuejs.org/

#### 核心依赖

##### 1. marked `^12.0.0`
- **用途**: Markdown 渲染为 HTML
- **功能**:
  - 快速的 Markdown 解析
  - 支持 GFM（GitHub Flavored Markdown）
  - 可自定义渲染规则
- **官网**: https://marked.js.org/
- **使用场景**: 预览模式下渲染 Markdown

```javascript
import { marked } from 'marked';

const renderedMarkdown = computed(() => {
  return marked(markdown.value);
});
```

##### 2. axios（通过 request.js 封装）
- **用途**: HTTP 请求库
- **功能**:
  - 发送文件上传请求
  - 接收二进制数据（docx 文件）
  - 请求拦截和响应处理
- **使用场景**: 与后端 API 通信

```javascript
export const uploadDocx = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return request({
    url: '/api/docx-converter/upload',
    method: 'POST',
    data: formData,
  });
};

export const convertMarkdownToDocx = (markdown) => {
  return request({
    url: '/api/docx-converter/markdown-to-docx',
    method: 'POST',
    data: { markdown },
    responseType: 'blob',
  });
};
```

## 📂 项目结构

```
project/
├── backend/
│   ├── src/
│   │   └── docx-converter/
│   │       ├── docx-converter.controller.ts   # API 控制器
│   │       ├── docx-converter.service.ts      # 核心转换逻辑
│   │       └── docx-converter.module.ts       # 模块定义
│   ├── uploads/
│   │   └── docx/                              # 临时文件存储
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── modules/
    │   │       └── docx.js                    # API 调用封装
    │   ├── components/
    │   │   └── DocxUploader.vue               # 上传和编辑组件
    │   └── views/
    │       └── docx/
    │           └── DocxConverter.vue          # 页面容器
    └── package.json
```

## 🔄 转换流程

### docx → Markdown

```
用户上传 .docx 文件
    ↓
[multer] 接收文件并保存到临时目录
    ↓
[mammoth] 读取 docx 文件，转换为 HTML
    ├── 解析 Word XML 结构
    ├── 应用样式映射
    └── 生成 HTML
    ↓
[turndown + gfm] 将 HTML 转换为 Markdown
    ├── 处理标题 (h1-h6 → #)
    ├── 处理粗体 (strong → **)
    ├── 处理斜体 (em → *)
    ├── 处理列表 (ul/ol → -/1.)
    └── 处理表格 (table → markdown table)
    ↓
清理和格式化
    ├── 移除多余空行
    ├── 优化粗体标记（添加空格）
    └── 清理转义字符
    ↓
返回 Markdown 文本给前端
    ↓
[marked] 前端渲染预览
```

### Markdown → docx

```
用户编辑 Markdown 文本
    ↓
点击"下载 DOCX"按钮
    ↓
前端发送 Markdown 文本到后端
    ↓
[markdown-it] 解析 Markdown 为 tokens
    ├── 识别标题、段落、列表
    ├── 识别粗体、斜体
    ├── 识别 HTML 块（表格）
    └── 生成 token 树
    ↓
遍历 tokens，转换为 docx 元素
    ├── heading_open → Paragraph with HeadingLevel
    ├── paragraph_open → Paragraph
    ├── strong → TextRun with bold: true
    ├── em → TextRun with italics: true
    └── html_block (table) → Table
    ↓
[docx] 生成 Word 文档
    ├── 创建 Document 对象
    ├── 添加所有元素
    └── 生成 Buffer
    ↓
返回二进制数据给前端
    ↓
前端触发浏览器下载
```

## 📋 支持的格式

### ✅ 完全支持

| 格式 | Markdown 语法 | 说明 |
|------|--------------|------|
| 标题 1-6 | `# ## ### ####` | 支持所有标题级别 |
| 粗体 | `**文本**` | 前后需要空格 |
| 斜体 | `*文本*` | 前后需要空格 |
| 列表 | `- 项目` 或 `1. 项目` | 有序和无序列表 |
| 段落 | 空行分隔 | 自动识别段落 |
| 行内代码 | `` `code` `` | 等宽字体 |
| 表格 | HTML `<table>` | 支持 HTML 表格 |

### ⚠️ 部分支持

| 格式 | 说明 |
|------|------|
| 代码块 | 转换为等宽字体段落 |
| 引用 | 转换为普通段落 |
| 链接 | 保留文本，丢失链接 |

### ❌ 不支持

| 格式 | 原因 |
|------|------|
| 图片 | docx 和 Markdown 图片处理复杂 |
| 颜色 | Markdown 不支持颜色 |
| 字体 | Markdown 不支持字体设置 |
| 合并单元格 | 实现复杂度高 |

## 🚀 安装和使用

### 后端安装

```bash
cd backend

# 安装依赖
npm install mammoth turndown turndown-plugin-gfm markdown-it docx

# 或使用 pnpm
pnpm install mammoth turndown turndown-plugin-gfm markdown-it docx
```

### 前端安装

```bash
cd frontend

# 安装依赖
npm install marked

# 或使用 pnpm
pnpm install marked
```

### 启动服务

```bash
# 后端（开发模式）
cd backend
npm run start:dev

# 前端（开发模式）
cd frontend
npm run dev
```

### 访问应用

```
http://localhost:5173/tools/docx-converter
```

## 📖 API 文档

### 1. 上传 docx 转换为 Markdown

**接口**: `POST /docx-converter/upload`

**请求**:
```http
Content-Type: multipart/form-data

file: [docx文件]
```

**响应**:
```json
{
  "success": true,
  "data": {
    "markdown": "# 标题\n\n内容...",
    "originalName": "document.docx",
    "size": 12345
  },
  "message": "文件转换成功"
}
```

### 2. Markdown 转换为 docx

**接口**: `POST /docx-converter/markdown-to-docx`

**请求**:
```http
Content-Type: application/json

{
  "markdown": "# 标题\n\n内容..."
}
```

**响应**: 
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="converted_xxx.docx"

[二进制 docx 文件数据]
```

## ⚙️ 配置选项

### 后端配置

#### 文件大小限制

```typescript
// backend/src/docx-converter/docx-converter.controller.ts
limits: {
  fileSize: 10 * 1024 * 1024, // 10MB
}
```

#### 上传目录

```typescript
destination: './uploads/docx',
```

#### 样式映射

```typescript
styleMap: [
  "p[style-name='Heading 1'] => h1:fresh",
  "p[style-name='Heading 2'] => h2:fresh",
  // 添加更多自定义映射
],
```

### 前端配置

#### API 基础地址

```javascript
// frontend/src/util/request.js
baseURL: 'http://127.0.0.1:8887'
```

#### 路由配置

```javascript
// frontend/src/router/modules/app.routes.js
{
  path: 'tools/docx-converter',
  name: 'DocxConverter',
  component: () => import('@/views/docx/DocxConverter.vue'),
  meta: { title: '文档转换', navKey: 'tools' }
}
```

## 🎯 核心算法

### 粗体格式优化

为了确保 Markdown 粗体能被正确识别，我们实现了智能空格添加：

```typescript
// 检查粗体内容是否以标点符号结尾
const endsWithPunctuation = /[，。！？、：；）】》」』:：]$/.test(content);

if (endsWithPunctuation) {
  // 将标点移到粗体标记外面
  const lastChar = content.slice(-1);
  const contentWithoutLast = content.slice(0, -1);
  return before + '**' + contentWithoutLast + '**' + lastChar + after;
}
```

### HTML 表格解析

使用正则表达式解析 HTML 表格：

```typescript
// 提取表格行
const trMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);

// 提取单元格
const cellMatches = trHtml.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);

// 移除 HTML 标签
let cellText = cellHtml
  .replace(/<[^>]+>/g, '')
  .trim();
```

## 🐛 常见问题

### Q1: 粗体不显示？

**原因**: 粗体标记前后没有空格

**解决**: 
```markdown
❌ 文本**粗体**文本
✅ 文本 **粗体** 文本
```

我们的工具会自动添加空格。

### Q2: 表格没有转换？

**原因**: 使用了 Markdown 表格语法而不是 HTML

**解决**: 使用 HTML 表格标签：
```html
<table>
  <tr>
    <td>单元格</td>
  </tr>
</table>
```

### Q3: 文件上传失败？

**检查**:
- 文件格式是否为 .docx
- 文件大小是否超过 10MB
- 后端服务是否正常运行

### Q4: 下载的 docx 打不开？

**检查**:
- 浏览器是否正确接收了二进制数据
- 后端是否正确设置了响应头
- Markdown 语法是否正确

## 📊 性能指标

| 操作 | 平均时间 | 文件大小 |
|------|---------|---------|
| docx → Markdown | 1-3秒 | 1-5MB |
| Markdown → docx | 0.5-2秒 | 1-100KB |
| 文件上传 | < 1秒 | < 10MB |

## 🔒 安全性

### 文件验证

- ✅ 文件类型验证（MIME type + 扩展名）
- ✅ 文件大小限制（10MB）
- ✅ 临时文件自动清理
- ✅ 错误信息脱敏

### 数据处理

- ✅ 异步处理，避免阻塞
- ✅ 异常捕获和处理
- ✅ 内存管理（及时释放）

## 📈 未来改进

### 短期计划

- [ ] 支持批量转换
- [ ] 添加进度条显示
- [ ] 支持 .doc 格式
- [ ] 优化表格样式

### 中期计划

- [ ] 支持图片转换
- [ ] 支持代码块高亮
- [ ] 添加转换历史
- [ ] 支持自定义样式

### 长期计划

- [ ] 支持 PDF 转换
- [ ] 支持协作编辑
- [ ] 云存储集成
- [ ] 移动端适配

## 📄 许可证

本项目是 maidai 项目的一部分。

## 👨‍💻 技术支持

如有问题，请查看：
- 项目文档
- GitHub Issues
- 技术博客

## 🙏 致谢

感谢以下开源项目：
- [mammoth.js](https://github.com/mwilliamson/mammoth.js)
- [turndown](https://github.com/mixmark-io/turndown)
- [markdown-it](https://github.com/markdown-it/markdown-it)
- [docx](https://docx.js.org/)
- [marked](https://marked.js.org/)

---

**开发完成时间**: 2025年12月29日  
**版本**: v2.0.0  
**状态**: ✅ 生产就绪

