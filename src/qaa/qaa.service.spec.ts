import { Test, TestingModule } from '@nestjs/testing';
import { QaaService } from './qaa.service';

describe('QaaService', () => {
  let service: QaaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QaaService],
    }).compile();

    service = module.get<QaaService>(QaaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
