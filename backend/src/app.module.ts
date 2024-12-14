import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatInfoModule } from './cat_info/cat_info.module';
import { UsersModule } from './users/users.module';
import { RoleModule } from './role/role.module';
import { CatTypeModule } from './cat_type/cat_type.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'tang6688',
      database: 'madai',
      synchronize: true,
      retryDelay: 500,
      retryAttempts: 10,
      autoLoadEntities: true,
    }),
    CatInfoModule,
    UsersModule,
    RoleModule,
    CatTypeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
