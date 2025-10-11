import { Body, Controller, Delete, Get, Patch, Post, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoWallService } from './photo_wall.service';

@Controller('photo-wall')
export class PhotoWallController {
  constructor(private readonly service: PhotoWallService) {}

  @Get('list')
  list(@Query('lastId') lastId?: number, @Query('limit') limit?: number) {
    return this.service.list({ lastId: lastId ? +lastId : undefined, limit: limit ? +limit : undefined });
  }

  @Post('add')
  add(@Body() dto: { image: string; description?: string }) {
    return this.service.create(dto);
  }

  @Patch('edit')
  edit(@Query('id') id: number, @Body() dto: { image?: string; description?: string }) {
    return this.service.update(+id, dto);
  }

  @Delete('delete')
  del(@Query('id') id: number) {
    return this.service.remove(+id);
  }

  // 纯上传接口：返回base64，前端拿到后再调用 add
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 8 * 1024 * 1024 } }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) return { code: 400, msg: '未选择文件', data: null };
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.mimetype)) return { code: 400, msg: '仅支持图片', data: null };
    return { code: 0, msg: 'success', data: { base64: file.buffer.toString('base64'), mimetype: file.mimetype, name: file.originalname } };
  }
}


