import { Controller, Get, Post, Body, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.register(createUserDto);
  }

  @Post('login')
  async login(
    @Body() { username, password }: { username: string; password: string },
  ) {
    return await this.usersService.login(username, password);
  }

  @Get('logout')
  async logout() {
    return await this.usersService.logout();
  }

  @Get('user-list')
  async userList() {
    return await this.usersService.findAll();
  }

  @Delete('remove-user')
  async remove(@Query('id') id: number) {
    return await this.usersService.remove(+id);
  }

  @Post('update-user')
  async update(
    @Body() { id, ...updateData }: { id: number; [key: string]: any },
  ) {
    return await this.usersService.update(id, updateData);
  }

  @Post('set-role')
  async setRole(@Body() { id, role }: { id: number; role: string }) {
    return await this.usersService.setRole(id, role);
  }
}
