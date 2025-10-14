import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ExcelTemplateService {
  private readonly templatePath = path.join(process.cwd(), 'uploads', 'template.xlsx');

  constructor() {
    this.ensureTemplateExists();
  }

  private ensureTemplateExists() {
    // 确保uploads目录存在
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 如果模板文件不存在，创建它
    if (!fs.existsSync(this.templatePath)) {
      this.generateTemplate();
    }
  }

  private generateTemplate() {
    console.log('开始生成模板文件...');
    console.log('模板路径:', this.templatePath);
    
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

    console.log('准备写入文件到:', this.templatePath);
    
    // 使用Buffer方式写入文件
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    fs.writeFileSync(this.templatePath, buffer);
    
    console.log('模板文件生成完成，文件大小:', buffer.length);
  }

  getTemplateBuffer(): Buffer {
    // 每次都重新生成模板，确保内容是最新的
    this.generateTemplate();
    return fs.readFileSync(this.templatePath);
  }

  getTemplatePath(): string {
    return this.templatePath;
  }
}
