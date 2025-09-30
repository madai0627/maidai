import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FinanceRecordService } from './finance_record.service';
import { QueryRecordDto } from './dto/query-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { CreateRecordDto } from './dto/create-record.dto';

@Controller('finance-record')
export class FinanceRecordController {
  constructor(private readonly service: FinanceRecordService) {}

  @Get('list')
  list(@Query() q: QueryRecordDto) {
    return this.service.list(q);
  }

  @Patch('edit')
  update(@Query('id') id: number, @Body() dto: UpdateRecordDto) {
    return this.service.update(+id, dto);
  }

  @Delete('delete')
  remove(@Query('id') id: number) {
    return this.service.remove(+id);
  }

  @Post('add')
  add(@Body() dto: CreateRecordDto) {
    return this.service.create(dto);
  }
}
