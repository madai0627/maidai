const XLSX = require('xlsx');
const fs = require('fs');

// 创建模板数据
const templateData = [
  ['分类', '题目', '选项A', '选项B', '选项C', '选项D', '正确答案', '难度'],
  [
    'JavaScript 基础',
    '以下哪个关键字创建函数表达式？',
    'function 关键字',
    'let 关键字', 
    'const 关键字',
    'var 关键字',
    'D',
    '1'
  ],
  [
    'JavaScript 基础',
    '关于 this 的指向，下列说法正确的是：',
    '箭头函数的 this 在调用时动态绑定',
    '箭头函数没有自己的 this，取决于定义时外层作用域',
    'call 可以改变箭头函数 this',
    'bind 会立即执行函数',
    'B',
    '1'
  ],
  [
    'Vue 框架',
    'Vue 3 的 Composition API 中，响应式数据使用：',
    'data()',
    'ref() 或 reactive()',
    'computed()',
    'watch()',
    'B',
    '2'
  ],
  [
    '浏览器与性能',
    '浏览器事件循环的执行顺序是：',
    '宏任务 -> 微任务 -> 渲染',
    '微任务 -> 宏任务 -> 渲染',
    '渲染 -> 宏任务 -> 微任务',
    '宏任务 -> 渲染 -> 微任务',
    'A',
    '3'
  ]
];

console.log('模板数据:', templateData);

// 创建工作簿
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(templateData);

// 设置列宽
const colWidths = [
  { wch: 15 }, // 分类
  { wch: 50 }, // 题目
  { wch: 30 }, // 选项A
  { wch: 30 }, // 选项B
  { wch: 30 }, // 选项C
  { wch: 30 }, // 选项D
  { wch: 10 }, // 正确答案
  { wch: 8 }   // 难度
];
worksheet['!cols'] = colWidths;

// 添加工作表到工作簿
XLSX.utils.book_append_sheet(workbook, worksheet, '题目模板');

// 写入文件
const outputPath = './test-template-manual.xlsx';
XLSX.writeFile(workbook, outputPath);

console.log('模板文件生成完成:', outputPath);

// 验证文件内容
const readWorkbook = XLSX.readFile(outputPath);
const readWorksheet = readWorkbook.Sheets['题目模板'];
const readData = XLSX.utils.sheet_to_json(readWorksheet, { header: 1 });

console.log('读取的数据:', readData);
