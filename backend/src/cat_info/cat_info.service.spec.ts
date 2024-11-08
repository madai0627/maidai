import { Test, TestingModule } from '@nestjs/testing';
import { CatInfoService } from './cat_info.service';

describe('CatInfoService', () => {
  let service: CatInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatInfoService],
    }).compile();

    service = module.get<CatInfoService>(CatInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
