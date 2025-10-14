import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ExcelTemplateService } from './excel-template.service';

@Controller('quiz/template')
export class ExcelTemplateController {
  constructor(private readonly templateService: ExcelTemplateService) {}

  @Get('download')
  downloadTemplate(@Res() res: Response) {
    try {
      const buffer = this.templateService.getTemplateBuffer();
      
      // 对中文文件名进行URL编码
      const filename = encodeURIComponent('题目导入模板.xlsx');
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
        'Content-Length': buffer.length.toString(),
      });

      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        message: '模板下载失败',
        error: error.message,
      });
    }
  }
}
