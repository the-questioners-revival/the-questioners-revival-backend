import { Test, TestingModule } from '@nestjs/testing';
import { QaaController } from './qaa.controller';

describe('QaaController', () => {
  let controller: QaaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QaaController],
    }).compile();

    controller = module.get<QaaController>(QaaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
