import { Test, TestingModule } from '@nestjs/testing';
import { CatTypeController } from './cat_type.controller';
import { CatTypeService } from './cat_type.service';

describe('CatTypeController', () => {
  let controller: CatTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatTypeController],
      providers: [CatTypeService],
    }).compile();

    controller = module.get<CatTypeController>(CatTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
