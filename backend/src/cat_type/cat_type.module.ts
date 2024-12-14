import { Module } from '@nestjs/common';
import { CatTypeService } from './cat_type.service';
import { CatTypeController } from './cat_type.controller';
import { CatType } from './entities/cat_type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CatType])],
  controllers: [CatTypeController],
  providers: [CatTypeService],
})
export class CatTypeModule {}
