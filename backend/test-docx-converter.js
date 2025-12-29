/**
 * 测试 docx 转换功能的脚本
 * 使用 Node.js 发送 HTTP 请求测试 API
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

// 创建一个测试用的简单 HTML 文件（模拟 docx 内容）
const testContent = `
测试 docx 转换功能
==================

这是一个测试文档，用于验证 docx 到 markdown 的转换功能。

## 功能特性

1. **粗体文本** - 支持粗体格式
2. *斜体文本* - 支持斜体格式
3. 普通文本 - 基本文本内容

## 测试列表

- 列表项 1
- 列表项 2
- 列表项 3

### 子标题

这是一个子标题下的内容，用于测试标题层级。

---

测试完成！
`;

console.log('📝 docx 转换功能测试脚本');
console.log('================================\n');

// 检查是否有测试文件
const testFilePath = path.join(__dirname, 'uploads', 'test.docx');

if (!fs.existsSync(testFilePath)) {
  console.log('❌ 测试文件不存在:', testFilePath);
  console.log('\n提示: 请手动创建一个 test.docx 文件放在 backend/uploads/ 目录下');
  console.log('或者使用前端页面进行测试: http://localhost:5173/tools/docx-converter\n');
  process.exit(0);
}

console.log('✅ 找到测试文件:', testFilePath);
console.log('📤 准备上传文件...\n');

// 创建 FormData
const form = new FormData();
form.append('file', fs.createReadStream(testFilePath));

// 发送请求
const options = {
  hostname: '127.0.0.1',
  port: 8887,
  path: '/docx-converter/upload',
  method: 'POST',
  headers: form.getHeaders(),
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 收到响应\n');
    console.log('状态码:', res.statusCode);
    console.log('响应头:', JSON.stringify(res.headers, null, 2));
    console.log('\n响应内容:');
    console.log('================================');
    
    try {
      const result = JSON.parse(data);
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success && result.data && result.data.markdown) {
        console.log('\n================================');
        console.log('✅ 转换成功！\n');
        console.log('Markdown 内容:');
        console.log('--------------------------------');
        console.log(result.data.markdown);
        console.log('--------------------------------');
      }
    } catch (error) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 请求失败:', error.message);
});

form.pipe(req);

