import { Injectable } from '@nestjs/common';
import { CreateCatInfoDto } from './dto/create-cat_info.dto';
import { UpdateCatInfoDto } from './dto/update-cat_info.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CatInfo } from './entities/cat_info.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class CatInfoService {
  constructor(
    @InjectRepository(CatInfo)
    private catInfoRepository: Repository<CatInfo>,
    private dataSource: DataSource,
  ) {}

  async create(createCatInfoDto: CreateCatInfoDto) {
    try {
      const catInfo = this.catInfoRepository.create(createCatInfoDto);
      await this.catInfoRepository.save(catInfo);
      return {
        code: 0,
        msg: '添加成功',
        data: catInfo,
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
    try {
      const catList = await this.catInfoRepository.find();
      return {
        code: 0,
        msg: 'success',
        data: catList,
      };
    } catch (error) {
      return {
        code: 500,
        msg: '查询失败：' + error.message,
        data: null,
      };
    }
  }

  async findOne(id: number) {
    try {
      const catInfo = await this.catInfoRepository.findOneBy({ id });
      if (!catInfo) {
        return {
          code: 404,
          msg: '猫咪信息不存在',
          data: null,
        };
      }
      return {
        code: 0,
        msg: 'success',
        data: catInfo,
      };
    } catch (error) {
      return {
        code: 500,
        msg: '查询失败：' + error.message,
        data: null,
      };
    }
  }

  async update(id: number, updateCatInfoDto: UpdateCatInfoDto) {
    try {
      const catInfo = await this.catInfoRepository.findOneBy({ id });
      if (!catInfo) {
        return {
          code: 404,
          msg: '猫咪信息不存在',
          data: null,
        };
      }

      await this.catInfoRepository.update(id, updateCatInfoDto);
      const updatedCatInfo = await this.catInfoRepository.findOneBy({ id });
      return {
        code: 0,
        msg: '更新成功',
        data: updatedCatInfo,
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
    try {
      const catInfo = await this.catInfoRepository.findOneBy({ id });
      if (!catInfo) {
        return {
          code: 404,
          msg: '猫咪信息不存在',
          data: null,
        };
      }

      await this.catInfoRepository.delete(id);
      return {
        code: 0,
        msg: '删除成功',
        data: null,
      };
    } catch (error) {
      return {
        code: 500,
        msg: '删除失败：' + error.message,
        data: null,
      };
    }
  }
}
