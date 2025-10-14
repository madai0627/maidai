const XLSX = require('xlsx');

// 读取下载的文件
const workbook = XLSX.readFile('./test-template-final.xlsx');
const worksheet = workbook.Sheets['题目模板'];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('下载的模板文件内容:');
console.log(data);

// 检查是否有undefined
const hasUndefined = data.some(row => row.some(cell => cell === undefined));
console.log('是否包含undefined:', hasUndefined);
