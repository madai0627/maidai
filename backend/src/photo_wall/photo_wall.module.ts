import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoWall } from './photo_wall.entity';
import { PhotoWallService } from './photo_wall.service';
import { PhotoWallController } from './photo_wall.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PhotoWall])],
  providers: [PhotoWallService],
  controllers: [PhotoWallController],
})
export class PhotoWallModule {}


