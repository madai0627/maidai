import { Test, TestingModule } from '@nestjs/testing';
import { CatTypeService } from './cat_type.service';

describe('CatTypeService', () => {
  let service: CatTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatTypeService],
    }).compile();

    service = module.get<CatTypeService>(CatTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
