import request from '../../util/request';

/**
 * 上传 docx 文件并转换为 markdown
 * @param {File} file - docx 文件对象
 * @returns {Promise} 返回包含 markdown 文本的响应
 */
export const uploadDocx = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return request({
    url: '/api/docx-converter/upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 将 markdown 转换为 docx 文件
 * @param {string} markdown - markdown 文本
 * @returns {Promise<Blob>} 返回 docx 文件的 Blob
 */
export const convertMarkdownToDocx = (markdown) => {
  return request({
    url: '/api/docx-converter/markdown-to-docx',
    method: 'POST',
    data: { markdown },
    responseType: 'blob', // 重要：接收二进制数据
  });
};

