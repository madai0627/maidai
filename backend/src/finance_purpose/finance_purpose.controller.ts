import { Controller, Get, Post, Body, Patch, Delete, Query } from '@nestjs/common';
import { FinancePurposeService } from './finance_purpose.service';
import { CreateFinancePurposeDto } from './dto/create-finance_purpose.dto';
import { UpdateFinancePurposeDto } from './dto/update-finance_purpose.dto';

@Controller('finance-purpose')
export class FinancePurposeController {
  constructor(private readonly service: FinancePurposeService) {}

  @Post('add')
  create(@Body() dto: CreateFinancePurposeDto) {
    return this.service.create(dto);
  }

  @Get('list')
  findAll() {
    return this.service.findAll();
  }

  @Patch('edit')
  update(@Query('id') id: number, @Body() dto: UpdateFinancePurposeDto) {
    return this.service.update(+id, dto);
  }

  @Delete('delete')
  remove(@Query('id') id: number) {
    return this.service.remove(+id);
  }
}


