import { Module } from '@nestjs/common';
import { CatInfoService } from './cat_info.service';
import { CatInfoController } from './cat_info.controller';
import { CatInfo } from './entities/cat_info.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CatInfo])],
  controllers: [CatInfoController],
  providers: [CatInfoService],
})
export class CatInfoModule {}
