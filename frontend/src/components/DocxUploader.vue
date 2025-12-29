<template>
  <div class="docx-uploader">
    <div class="upload-area">
      <div
        class="drop-zone"
        :class="{ 'is-dragover': isDragover, 'is-disabled': loading }"
        @drop.prevent="handleDrop"
        @dragover.prevent="isDragover = true"
        @dragleave.prevent="isDragover = false"
      >
        <div v-if="!loading" class="drop-zone-content">
          <svg
            class="upload-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p class="drop-zone-text">拖拽 .docx 文件到这里，或者</p>
          <label class="file-input-label">
            <input
              ref="fileInput"
              type="file"
              accept=".docx"
              class="file-input"
              @change="handleFileSelect"
            />
            <span class="btn-browse">浏览文件</span>
          </label>
          <p class="file-hint">支持 .docx 格式，最大 10MB</p>
        </div>
        <div v-else class="loading-content">
          <div class="spinner"></div>
          <p>正在转换文件...</p>
        </div>
      </div>

      <!-- 文件信息显示 -->
      <div v-if="selectedFile && !loading" class="file-info">
        <div class="file-info-content">
          <svg
            class="file-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div class="file-details">
            <p class="file-name">{{ selectedFile.name }}</p>
            <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
          <button class="btn-remove" @click="removeFile">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 上传按钮 -->
      <button
        v-if="selectedFile && !loading"
        class="btn-upload"
        @click="uploadFile"
      >
        开始转换
      </button>
    </div>

    <!-- Markdown 编辑和预览区域 -->
    <div v-if="markdown" class="markdown-preview">
      <div class="preview-header">
        <h3>转换结果</h3>
        <div class="preview-actions">
          <button 
            class="btn-tab"
            :class="{ active: activeTab === 'edit' }"
            @click="activeTab = 'edit'"
          >
            编辑
          </button>
          <button 
            class="btn-tab"
            :class="{ active: activeTab === 'preview' }"
            @click="activeTab = 'preview'"
          >
            预览
          </button>
          <button class="btn-copy" @click="copyMarkdown">
            {{ copied ? '已复制' : '复制' }}
          </button>
          <button class="btn-download-md" @click="downloadMarkdown">
            下载 MD
          </button>
          <button class="btn-download-docx" @click="downloadDocx" :disabled="downloadingDocx">
            {{ downloadingDocx ? '转换中...' : '下载 DOCX' }}
          </button>
        </div>
      </div>
      <div class="preview-content">
        <!-- 编辑模式 -->
        <textarea 
          v-if="activeTab === 'edit'"
          v-model="markdown"
          class="markdown-editor"
          placeholder="在这里编辑 Markdown..."
        ></textarea>
        
        <!-- 预览模式 -->
        <div 
          v-else
          class="markdown-rendered"
          v-html="renderedMarkdown"
        ></div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ error }}</span>
      <button class="btn-close-error" @click="error = ''">×</button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { marked } from 'marked';
import { uploadDocx, convertMarkdownToDocx } from '../api/modules/docx';

export default {
  name: 'DocxUploader',
  setup() {
    const selectedFile = ref(null);
    const markdown = ref('');
    const loading = ref(false);
    const downloadingDocx = ref(false);
    const error = ref('');
    const isDragover = ref(false);
    const copied = ref(false);
    const fileInput = ref(null);
    const activeTab = ref('edit'); // 'edit' 或 'preview'
    
    // 渲染 Markdown 为 HTML
    const renderedMarkdown = computed(() => {
      if (!markdown.value) return '';
      return marked(markdown.value);
    });

    /**
     * 处理文件选择
     */
    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        validateAndSetFile(file);
      }
    };

    /**
     * 处理拖拽文件
     */
    const handleDrop = (event) => {
      isDragover.value = false;
      if (loading.value) return;

      const file = event.dataTransfer.files[0];
      if (file) {
        validateAndSetFile(file);
      }
    };

    /**
     * 验证并设置文件
     */
    const validateAndSetFile = (file) => {
      error.value = '';

      // 验证文件类型
      if (!file.name.toLowerCase().endsWith('.docx')) {
        error.value = '只支持 .docx 格式的文件';
        return;
      }

      // 验证文件大小（10MB）
      if (file.size > 10 * 1024 * 1024) {
        error.value = '文件大小不能超过 10MB';
        return;
      }

      selectedFile.value = file;
      markdown.value = ''; // 清空之前的结果
    };

    /**
     * 移除选中的文件
     */
    const removeFile = () => {
      selectedFile.value = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    /**
     * 上传文件
     */
    const uploadFile = async () => {
      if (!selectedFile.value || loading.value) return;

      loading.value = true;
      error.value = '';

      try {
        const response = await uploadDocx(selectedFile.value);
        if (response.success) {
          markdown.value = response.data.markdown;
        } else {
          error.value = response.message || '转换失败';
        }
      } catch (err) {
        error.value = err.message || '转换失败，请稍后重试';
      } finally {
        loading.value = false;
      }
    };

    /**
     * 复制 markdown 到剪贴板
     */
    const copyMarkdown = async () => {
      try {
        await navigator.clipboard.writeText(markdown.value);
        copied.value = true;
        setTimeout(() => {
          copied.value = false;
        }, 2000);
      } catch (err) {
        error.value = '复制失败';
      }
    };

    /**
     * 下载 markdown 文件
     */
    const downloadMarkdown = () => {
      const blob = new Blob([markdown.value], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile.value.name.replace('.docx', '')}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    /**
     * 下载 docx 文件
     */
    const downloadDocx = async () => {
      if (!markdown.value || downloadingDocx.value) return;

      downloadingDocx.value = true;
      error.value = '';

      try {
        const response = await convertMarkdownToDocx(markdown.value);
        
        // 创建 Blob 并下载
        const blob = new Blob([response], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedFile.value.name.replace('.docx', '')}_converted.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        error.value = err.message || '转换失败，请稍后重试';
      } finally {
        downloadingDocx.value = false;
      }
    };

    /**
     * 格式化文件大小
     */
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return {
      selectedFile,
      markdown,
      loading,
      downloadingDocx,
      error,
      isDragover,
      copied,
      fileInput,
      activeTab,
      renderedMarkdown,
      handleFileSelect,
      handleDrop,
      removeFile,
      uploadFile,
      copyMarkdown,
      downloadMarkdown,
      downloadDocx,
      formatFileSize,
    };
  },
};
</script>

<style scoped>
.docx-uploader {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.upload-area {
  margin-bottom: 30px;
}

/* 拖拽区域 */
.drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

.drop-zone:hover:not(.is-disabled) {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.drop-zone.is-dragover {
  border-color: #3b82f6;
  background-color: #dbeafe;
  transform: scale(1.02);
}

.drop-zone.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  width: 64px;
  height: 64px;
  color: #9ca3af;
}

.drop-zone-text {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.file-input {
  display: none;
}

.file-input-label {
  cursor: pointer;
}

.btn-browse {
  display: inline-block;
  padding: 10px 24px;
  background-color: #3b82f6;
  color: white;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-browse:hover {
  background-color: #2563eb;
}

.file-hint {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

/* 加载状态 */
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 文件信息 */
.file-info {
  margin-top: 20px;
  padding: 16px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.file-info-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  width: 40px;
  height: 40px;
  color: #3b82f6;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #111827;
  margin: 0 0 4px 0;
}

.file-size {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.btn-remove {
  width: 32px;
  height: 32px;
  padding: 0;
  background-color: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.btn-remove:hover {
  background-color: #fee2e2;
}

.btn-remove svg {
  width: 20px;
  height: 20px;
}

/* 上传按钮 */
.btn-upload {
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-upload:hover {
  background-color: #059669;
}

/* Markdown 预览 */
.markdown-preview {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.preview-header h3 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.btn-tab {
  padding: 8px 16px;
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 8px;
}

.btn-tab:hover {
  background-color: #e5e7eb;
}

.btn-tab.active {
  background-color: #3b82f6;
  color: white;
}

.btn-copy,
.btn-download-md,
.btn-download-docx {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-copy:hover,
.btn-download-md:hover,
.btn-download-docx:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-download-docx {
  background-color: #10b981;
}

.btn-download-docx:hover:not(:disabled) {
  background-color: #059669;
}

.btn-download-docx:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.preview-content {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.markdown-editor {
  width: 100%;
  min-height: 400px;
  padding: 16px;
  border: none;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  resize: vertical;
  outline: none;
}

.markdown-rendered {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

/* Markdown 渲染样式 */
.markdown-rendered h1,
.markdown-rendered h2,
.markdown-rendered h3,
.markdown-rendered h4,
.markdown-rendered h5,
.markdown-rendered h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-rendered h1 {
  font-size: 2em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-rendered h2 {
  font-size: 1.5em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-rendered h3 {
  font-size: 1.25em;
}

.markdown-rendered p {
  margin-bottom: 16px;
}

.markdown-rendered strong {
  font-weight: 600;
}

.markdown-rendered em {
  font-style: italic;
}

.markdown-rendered ul,
.markdown-rendered ol {
  padding-left: 2em;
  margin-bottom: 16px;
}

.markdown-rendered li {
  margin-bottom: 4px;
}

.markdown-rendered table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

.markdown-rendered table th,
.markdown-rendered table td {
  border: 1px solid #d1d5db;
  padding: 8px 12px;
  text-align: left;
}

.markdown-rendered table th {
  background-color: #f3f4f6;
  font-weight: 600;
}

.markdown-rendered code {
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-rendered pre {
  background-color: #f3f4f6;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-rendered pre code {
  background-color: transparent;
  padding: 0;
}

/* 错误提示 */
.error-message {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding: 12px 16px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
}

.error-message svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.error-message span {
  flex: 1;
}

.btn-close-error {
  width: 24px;
  height: 24px;
  padding: 0;
  background-color: transparent;
  border: none;
  color: #dc2626;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-close-error:hover {
  background-color: #fee2e2;
}
</style>

