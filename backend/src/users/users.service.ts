import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private dataSource: DataSource,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const username = createUserDto.username;
    const currentUser = await this.usersRepository.findOneBy({ username });
    if (currentUser) {
      return {
        code: 400,
        msg: '用户名已存在',
        data: null,
      };
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      username: createUserDto.username,
      password: hashedPassword,
      role: createUserDto.role || 'user', // 如果没有传递role，默认为'user'
    });
    await this.usersRepository.save(user);
    const userSuccess = await this.usersRepository.findOneBy({ username });
    return {
      code: 0,
      msg: '注册成功',
      data: userSuccess,
    };
  }

  async login(username: string, password: string) {
    const user = await this.usersRepository.findOneBy({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      return {
        code: 0,
        msg: '登录成功',
        data: user,
      };
    }
    return {
      code: 400,
      msg: '用户名或密码错误',
      data: null,
    };
  }

  async logout() {
    return {
      code: 0,
      msg: '退出成功',
      data: null,
    };
  }

  async findAll() {
    const userList = await this.usersRepository.find();
    return {
      code: 0,
      data: userList,
      msg: 'success',
    };
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      return {
        code: 404,
        msg: '用户不存在',
        data: null,
      };
    }

    await this.usersRepository.delete(id);
    return {
      code: 0,
      msg: '删除成功',
      data: null,
    };
  }

  async update(id: number, updateUserDto: any) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      return {
        code: 404,
        msg: '用户不存在',
        data: null,
      };
    }

    // 如果更新了密码，需要重新加密
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    await this.usersRepository.update(id, updateUserDto);
    const updatedUser = await this.usersRepository.findOneBy({ id });
    return {
      code: 0,
      msg: '更新成功',
      data: updatedUser,
    };
  }

  async setRole(id: number, role: string) {
    await this.usersRepository.update(id, { role });
    return {
      code: 0,
      msg: '分配成功',
    };
  }
}
