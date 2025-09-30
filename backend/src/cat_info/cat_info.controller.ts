import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CatInfoService } from './cat_info.service';
import { CreateCatInfoDto } from './dto/create-cat_info.dto';
import { UpdateCatInfoDto } from './dto/update-cat_info.dto';

@Controller('cat-info')
export class CatInfoController {
  constructor(private readonly catInfoService: CatInfoService) {}

  @Post('save-cat')
  async create(@Body() createCatInfoDto: CreateCatInfoDto) {
    return await this.catInfoService.create(createCatInfoDto);
  }

  @Get('get-cat')
  async findAll() {
    return await this.catInfoService.findAll();
  }

  @Get('search-cat')
  async findOne(@Query('id') id: number) {
    return await this.catInfoService.findOne(+id);
  }

  @Patch('update-cat')
  async update(
    @Query('id') id: number,
    @Body() updateCatInfoDto: UpdateCatInfoDto,
  ) {
    return await this.catInfoService.update(+id, updateCatInfoDto);
  }

  @Delete('remove-cat')
  async remove(@Query('id') id: number) {
    return await this.catInfoService.remove(+id);
  }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return await this.catInfoService.uploadImage(file);
  }
}
