import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatType } from './entities/cat_type.entity';
import { CreateCatTypeDto } from './dto/create-cat_type.dto';
import { UpdateCatTypeDto } from './dto/update-cat_type.dto';

@Injectable()
export class CatTypeService {
  constructor(
    @InjectRepository(CatType)
    private catTypeRepository: Repository<CatType>,
  ) {}

  async create(createCatTypeDto: CreateCatTypeDto) {
    try {
      const catType = this.catTypeRepository.create(createCatTypeDto);
      await this.catTypeRepository.save(catType);
      return {
        code: 0,
        msg: '添加成功',
        data: catType,
      };
    } catch (error) {
      return {
        code: 500,
        msg: '添加失败：' + error.message,
        data: null,
      };
    }
  }

  async findAll() {
    const catTypes = await this.catTypeRepository.find();
    return {
      code: 0,
      msg: 'success',
      data: catTypes,
    };
  }

  async findOne(id: number) {
    const catType = await this.catTypeRepository.findOneBy({ id });
    if (!catType) {
      return {
        code: 404,
        msg: '分类不存在',
        data: null,
      };
    }
    return {
      code: 0,
      msg: 'success',
      data: catType,
    };
  }

  async update(id: number, updateCatTypeDto: UpdateCatTypeDto) {
    try {
      const catType = await this.catTypeRepository.findOneBy({ id });
      if (!catType) {
        return {
          code: 404,
          msg: '分类不存在',
          data: null,
        };
      }

      await this.catTypeRepository.update(id, updateCatTypeDto);
      const updatedCatType = await this.catTypeRepository.findOneBy({ id });
      return {
        code: 0,
        msg: '更新成功',
        data: updatedCatType,
      };
    } catch (error) {
      return {
        code: 500,
        msg: '更新失败：' + error.message,
        data: null,
      };
    }
  }

  async remove(id: number) {
    const catType = await this.catTypeRepository.findOneBy({ id });
    if (!catType) {
      return {
        code: 404,
        msg: '分类不存在',
        data: null,
      };
    }

    await this.catTypeRepository.delete(id);
    return {
      code: 0,
      msg: '删除成功',
      data: null,
    };
  }

  async uploadImage(file: Express.Multer.File) {
    try {
      if (!file) {
        return {
          code: 400,
          msg: '没有上传文件',
          data: null,
        };
      }

      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return {
          code: 400,
          msg: '不支持的文件类型，请上传图片文件',
          data: null,
        };
      }

      // 验证文件大小 (5MB限制)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          code: 400,
          msg: '文件大小不能超过5MB',
          data: null,
        };
      }

      return {
        code: 0,
        msg: '上传成功',
        data: {
          base64: file.buffer.toString('base64'),
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
      };
    } catch (error) {
      return {
        code: 500,
        msg: '上传失败：' + error.message,
        data: null,
      };
    }
  }
}
