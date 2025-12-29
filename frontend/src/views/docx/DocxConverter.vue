<template>
  <div class="docx-converter-page">
    <div class="page-header">
      <h1>文档转换工具</h1>
      <p class="page-description">
        上传 Word 文档（.docx），快速转换为 Markdown 格式
      </p>
    </div>

    <DocxUploader />

    <div class="usage-tips">
      <h3>使用说明</h3>
      <ul>
        <li>支持 .docx 格式的 Word 文档</li>
        <li>文件大小限制为 10MB</li>
        <li>转换后的 Markdown 保留文档的基本格式（标题、粗体、斜体等）</li>
        <li>可以直接复制结果或下载为 .md 文件</li>
      </ul>
    </div>
  </div>
</template>

<script>
import DocxUploader from '../../components/DocxUploader.vue';

export default {
  name: 'DocxConverter',
  components: {
    DocxUploader,
  },
};
</script>

<style scoped>
.docx-converter-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
}

.page-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.usage-tips {
  margin-top: 40px;
  padding: 24px;
  background-color: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.usage-tips h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
}

.usage-tips ul {
  margin: 0;
  padding-left: 24px;
}

.usage-tips li {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.8;
  margin-bottom: 8px;
}

.usage-tips li:last-child {
  margin-bottom: 0;
}
</style>

