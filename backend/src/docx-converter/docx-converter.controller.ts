import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocxConverterService } from './docx-converter.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('docx-converter')
export class DocxConverterController {
  constructor(private readonly docxConverterService: DocxConverterService) {}

  /**
   * 上传 docx 文件并转换为 markdown
   * @param file 上传的 docx 文件
   * @returns markdown 格式的文本
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/docx',
        filename: (req, file, callback) => {
          // 生成唯一文件名
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // 只允许 docx 文件
        if (
          file.mimetype ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          extname(file.originalname).toLowerCase() === '.docx'
        ) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('只支持 .docx 格式的文件'),
            false,
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 限制文件大小为 10MB
      },
    }),
  )
  async uploadDocx(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    try {
      // 转换为 markdown
      const markdown = await this.docxConverterService.convertToMarkdown(
        file.path,
      );

      // 删除上传的临时文件
      await this.docxConverterService.deleteFile(file.path);

      return {
        success: true,
        data: {
          markdown,
          originalName: file.originalname,
          size: file.size,
        },
        message: '文件转换成功',
      };
    } catch (error) {
      // 如果转换失败，也删除临时文件
      await this.docxConverterService.deleteFile(file.path);
      throw new BadRequestException(`文件转换失败: ${error.message}`);
    }
  }

  /**
   * 将 Markdown 转换为 docx 文件
   * @param body 包含 markdown 文本的请求体
   * @param res Express Response 对象
   */
  @Post('markdown-to-docx')
  async convertMarkdownToDocx(
    @Body() body: { markdown: string },
    @Res() res: Response,
  ) {
    const { markdown } = body;

    if (!markdown) {
      throw new BadRequestException('请提供 Markdown 内容');
    }

    try {
      // 转换为 docx
      const buffer = await this.docxConverterService.convertMarkdownToDocx(
        markdown,
      );

      // 设置响应头
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="converted_${Date.now()}.docx"`,
      );
      res.setHeader('Content-Length', buffer.length);

      // 发送文件
      res.send(buffer);
    } catch (error) {
      throw new BadRequestException(`Markdown 转换失败: ${error.message}`);
    }
  }
}

