import { Module } from '@nestjs/common';
import { ExcelTemplateService } from './excel-template.service';
import { ExcelTemplateController } from './excel-template.controller';

@Module({
  providers: [ExcelTemplateService],
  controllers: [ExcelTemplateController],
  exports: [ExcelTemplateService],
})
export class ExcelTemplateModule {}
