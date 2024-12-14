import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class RoleService {

  constructor(
    @InjectRepository(Role)
    private usersRepository: Repository<Role>,
    private dataSource: DataSource,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    createRoleDto.created_at = new Date()
    await this.usersRepository.save(createRoleDto);
    return {
      code: 0,
      msg: '添加成功'
    }
  }

  async findAll() {
    const roleList = await this.usersRepository.find();
    return {
      code: 0,
      data: roleList,
      msg: 'success'
    }
  }


  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.usersRepository.update(id, updateRoleDto);
    return {
      code: 0,
      msg: '编辑成功'
    }
  }

  async remove(id: number) {
    await this.usersRepository.delete(id);
    return {
      code: 0,
      msg: '删除成功'
    }
  }
}
