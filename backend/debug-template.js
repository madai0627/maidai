const XLSX = require('xlsx');

try {
  // 读取下载的文件
  const workbook = XLSX.readFile('./test-template-debug.xlsx');
  console.log('工作簿工作表名称:', workbook.SheetNames);
  
  const worksheet = workbook.Sheets['题目模板'];
  if (!worksheet) {
    console.log('找不到"题目模板"工作表');
    console.log('可用的工作表:', workbook.SheetNames);
    return;
  }
  
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log('下载的模板文件内容:');
  console.log(JSON.stringify(data, null, 2));
  
  // 检查是否有undefined
  const hasUndefined = data.some(row => row.some(cell => cell === undefined));
  console.log('是否包含undefined:', hasUndefined);
  
  // 检查数据行数
  console.log('数据行数:', data.length);
  
  if (data.length > 0) {
    console.log('第一行内容:', data[0]);
    console.log('第一行长度:', data[0].length);
  }
  
} catch (error) {
  console.error('读取文件失败:', error.message);
}
