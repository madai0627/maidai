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
    const username = createUserDto.username
    const password = createUserDto.password
    const currentUser = await this.usersRepository.findOneBy({ username });
    if(currentUser) {
      return {
        code: 400,
        msg: '用户名已存在',
        data: null
      }
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    createUserDto.created_at = new Date()
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    await this.usersRepository.save(user)
    const userSuccess = await this.usersRepository.findOneBy({ username });
    return {
      code: 0,
      msg: '注册成功',
      data: userSuccess
    }
  }

  async login(username: string, password: string) {
    const user = await this.usersRepository.findOneBy({ username });
    if(user && await bcrypt.compare(password, user.password)) {
      return {
        code: 0,
        msg: '登录成功',
        data: user
      }
    }
    return {
      code: 400,
      msg: '用户名或密码错误',
      data: null
    }
  }

  async logout() {
    return {
      code: 0,
      msg: '退出成功',
      data: null
    }
  }

  async findAll() {
    const userList = await this.usersRepository.find();
    return {
      code: 0,
      data: userList,
      msg: 'success'
    }
  }

  async remove(id: number) {
    return await this.usersRepository.delete(id);
  }

  async setRole(id: number, role: string) {
    await this.usersRepository.update(id, { role });
    return {
      code: 0,
      msg: '分配成功',
    }
  }
}
