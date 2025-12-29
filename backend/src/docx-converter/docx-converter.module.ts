import { Module } from '@nestjs/common';
import { DocxConverterController } from './docx-converter.controller';
import { DocxConverterService } from './docx-converter.service';

@Module({
  controllers: [DocxConverterController],
  providers: [DocxConverterService],
  exports: [DocxConverterService],
})
export class DocxConverterModule {}

