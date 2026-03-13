# 图片支持功能说明

## ✨ 新增功能

DOCX 转换工具现在完全支持图片处理！

## 🔄 功能详情

### 1. DOCX → Markdown（图片提取）

当你上传包含图片的 DOCX 文件时：

- ✅ 自动提取所有图片
- ✅ 将图片转换为 base64 编码
- ✅ 嵌入到 Markdown 中（使用 `data:image/...;base64,...` 格式）
- ✅ 支持所有常见图片格式（PNG、JPG、GIF、BMP 等）

**示例输出：**

```markdown
这是一段文字

![图片描述](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...)

这是图片后的文字
```

### 2. Markdown → DOCX（图片嵌入）

当你将 Markdown 转换回 DOCX 时：

- ✅ 支持 base64 编码的图片
- ✅ 支持 HTTP/HTTPS 网络图片
- ✅ 支持本地文件路径
- ✅ 自动调整图片大小（默认宽度 600px）
- ✅ 保持图片在文档中的位置

**支持的图片格式：**

```markdown
<!-- Base64 图片 -->
![描述](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...)

<!-- 网络图片 -->
![描述](https://example.com/image.png)

<!-- 本地文件（服务器端路径） -->
![描述](./images/photo.jpg)
```

## 🎯 使用方法

### 步骤 1：上传包含图片的 DOCX

1. 打开 DOCX 转换工具页面
2. 点击"选择文件"或拖拽 DOCX 文件
3. 等待转换完成
4. 在编辑器中查看转换后的 Markdown（图片已转为 base64）

### 步骤 2：编辑 Markdown

- 在"编辑"标签页中修改文本
- 切换到"预览"标签页查看效果
- 图片会正常显示在预览中

### 步骤 3：下载 DOCX

1. 点击"下载 DOCX"按钮
2. 后端会自动处理所有图片
3. 下载的 DOCX 文件包含所有图片

## 🔧 技术实现

### 后端处理

**DOCX → Markdown:**

```typescript
// 使用 mammoth 的 convertImage 选项
convertImage: mammoth.images.imgElement((image) => {
  return image.read('base64').then((imageBuffer) => {
    const contentType = image.contentType || 'image/png';
    return {
      src: `data:${contentType};base64,${imageBuffer}`,
    };
  });
})
```

**Markdown → DOCX:**

```typescript
// 解析图片并创建 ImageRun
const imageBuffer = await this.getImageBuffer(imageSrc);
new ImageRun({
  data: imageBuffer,
  transformation: {
    width: 600,
    height: 400,
  },
  type: 'png',
})
```

### 支持的图片源

| 类型 | 格式 | 示例 |
|------|------|------|
| Base64 | `data:image/...;base64,...` | `data:image/png;base64,iVBORw0...` |
| HTTP | `http://...` | `http://example.com/image.jpg` |
| HTTPS | `https://...` | `https://example.com/image.png` |
| 本地文件 | 相对/绝对路径 | `./images/photo.jpg` |

## ⚠️ 注意事项

### 1. 文件大小限制

- 单个文件最大 10MB
- 如果 DOCX 包含大量高分辨率图片，可能会超出限制
- 建议压缩图片后再使用

### 2. Base64 编码

- Base64 会增加约 33% 的数据大小
- 大量图片会导致 Markdown 文件很大
- 浏览器可能需要更多时间渲染

### 3. 网络图片

- 需要确保图片 URL 可访问
- 转换时会实时下载图片
- 下载失败的图片会显示为占位文本

### 4. 图片尺寸

- 默认宽度：600px
- 默认高度：400px（会自动保持比例）
- 可以在代码中调整默认尺寸

## 📦 依赖包

新增的依赖：

```json
{
  "cheerio": "^1.0.0",        // HTML 解析
  "@types/cheerio": "^0.22.0" // TypeScript 类型
}
```

## 🐛 故障排除

### 问题 1：图片不显示

**原因：** Base64 数据损坏或格式不正确

**解决：** 检查 Markdown 中的图片 URL 是否完整

### 问题 2：转换失败

**原因：** 图片文件过大或格式不支持

**解决：** 
- 压缩图片
- 转换为 PNG/JPG 格式
- 检查后端日志

### 问题 3：下载的 DOCX 没有图片

**原因：** 图片 URL 无法访问或 base64 解码失败

**解决：**
- 检查网络连接
- 确保图片 URL 有效
- 查看浏览器控制台错误

## 🎨 示例

### 完整示例：包含图片的 Markdown

```markdown
# 我的文档

这是一段介绍文字。

## 截图展示

下面是一张截图：

![应用截图](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==)

## 网络图片

这是一张网络图片：

![Logo](https://via.placeholder.com/150)

## 总结

文档中可以包含多种类型的图片。
```

## 🚀 性能优化建议

1. **图片压缩**：上传前压缩图片
2. **批量处理**：避免一次处理太多大图片
3. **缓存机制**：考虑缓存已下载的网络图片
4. **异步处理**：大文件使用异步转换

## 📝 更新日志

### v1.1.0 (2025-12-29)

- ✅ 新增图片提取功能（DOCX → Markdown）
- ✅ 新增图片嵌入功能（Markdown → DOCX）
- ✅ 支持 base64、HTTP/HTTPS、本地文件
- ✅ 自动图片尺寸调整
- ✅ 完善错误处理

## 🔗 相关文档

- [DOCX 转换工具完整文档](./DOCX-CONVERTER-README.md)
- [快速参考指南](./DOCX-CONVERTER-QUICK-REFERENCE.md)

---

**提示：** 如果遇到任何问题，请检查浏览器控制台和后端日志获取详细错误信息。

