import { Test, TestingModule } from '@nestjs/testing';
import { CatInfoController } from './cat_info.controller';
import { CatInfoService } from './cat_info.service';

describe('CatInfoController', () => {
  let controller: CatInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatInfoController],
      providers: [CatInfoService],
    }).compile();

    controller = module.get<CatInfoController>(CatInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
