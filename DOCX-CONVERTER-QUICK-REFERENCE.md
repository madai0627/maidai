# Word ↔ Markdown 转换工具 - 快速参考

## 🎯 核心技术栈

### 后端（NestJS）

| 库 | 版本 | 用途 |
|---|------|------|
| **mammoth** | ^1.8.0 | docx → HTML |
| **turndown** | ^7.2.0 | HTML → Markdown |
| **turndown-plugin-gfm** | ^1.0.2 | 表格支持 |
| **markdown-it** | ^14.1.0 | Markdown 解析 |
| **docx** | ^8.5.0 | 生成 docx |
| **multer** | ^2.0.2 | 文件上传 |

### 前端（Vue 3）

| 库 | 版本 | 用途 |
|---|------|------|
| **marked** | ^12.0.0 | Markdown 渲染 |
| **axios** | - | HTTP 请求 |

## 📦 安装命令

```bash
# 后端
cd backend
npm install mammoth turndown turndown-plugin-gfm markdown-it docx

# 前端
cd frontend
npm install marked
```

## 🔄 转换流程

### docx → Markdown
```
.docx → [mammoth] → HTML → [turndown] → Markdown
```

### Markdown → docx
```
Markdown → [markdown-it] → tokens → [docx] → .docx
```

## 📁 关键文件

```
backend/src/docx-converter/
├── docx-converter.controller.ts  # API 接口
├── docx-converter.service.ts     # 转换逻辑
└── docx-converter.module.ts      # 模块定义

frontend/src/
├── api/modules/docx.js            # API 调用
├── components/DocxUploader.vue    # 上传组件
└── views/docx/DocxConverter.vue   # 页面
```

## 🚀 快速启动

```bash
# 后端
cd backend && npm run start:dev

# 前端
cd frontend && npm run dev

# 访问
http://localhost:5173/tools/docx-converter
```

## 📊 支持的格式

| 格式 | docx→MD | MD→docx |
|------|---------|---------|
| 标题 | ✅ | ✅ |
| 粗体 | ✅ | ✅ |
| 斜体 | ✅ | ✅ |
| 列表 | ✅ | ✅ |
| 表格 | ✅ | ✅ |
| 图片 | ❌ | ❌ |

## 🔧 核心代码示例

### mammoth 使用
```typescript
import * as mammoth from 'mammoth';

const result = await mammoth.convertToHtml({ path: filePath });
```

### turndown 使用
```typescript
import * as TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const service = new TurndownService();
service.use(gfm);
const markdown = service.turndown(html);
```

### markdown-it 使用
```typescript
import * as MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: true });
const tokens = md.parse(markdown, {});
```

### docx 使用
```typescript
import { Document, Packer, Paragraph } from 'docx';

const doc = new Document({
  sections: [{ children: [...] }]
});
const buffer = await Packer.toBuffer(doc);
```

### marked 使用
```javascript
import { marked } from 'marked';

const html = marked(markdown);
```

## 📝 API 端点

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | `/docx-converter/upload` | docx → Markdown |
| POST | `/docx-converter/markdown-to-docx` | Markdown → docx |

## ⚙️ 配置

### 文件大小限制
```typescript
limits: { fileSize: 10 * 1024 * 1024 } // 10MB
```

### 上传目录
```typescript
destination: './uploads/docx'
```

## 🐛 常见问题

| 问题 | 解决方案 |
|------|---------|
| 粗体不显示 | 确保 `**` 前后有空格 |
| 表格未转换 | 使用 HTML 表格标签 |
| 上传失败 | 检查文件格式和大小 |
| 端口占用 | `taskkill /F /PID <pid>` |

## 📚 参考链接

- [mammoth.js](https://github.com/mwilliamson/mammoth.js)
- [turndown](https://github.com/mixmark-io/turndown)
- [markdown-it](https://github.com/markdown-it/markdown-it)
- [docx](https://docx.js.org/)
- [marked](https://marked.js.org/)

---

**详细文档**: 查看 `DOCX-CONVERTER-README.md`

