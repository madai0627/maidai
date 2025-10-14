const XLSX = require('xlsx');

// 读取下载的文件
const workbook = XLSX.readFile('./test-template-new.xlsx');
const worksheet = workbook.Sheets['题目模板'];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('新下载的模板文件内容:');
console.log(data);

// 检查是否有undefined
const hasUndefined = data.some(row => row.some(cell => cell === undefined));
console.log('是否包含undefined:', hasUndefined);

// 检查第一行是否是标题行
if (data.length > 0) {
  console.log('第一行内容:', data[0]);
  console.log('第一行是否包含"分类":', data[0].includes('分类'));
}
