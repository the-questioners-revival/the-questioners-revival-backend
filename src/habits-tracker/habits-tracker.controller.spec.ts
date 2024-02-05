import { Test, TestingModule } from '@nestjs/testing';
import { HabitsTrackerController } from './habits-tracker.controller';

describe('HabitsTrackerController', () => {
  let controller: HabitsTrackerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HabitsTrackerController],
    }).compile();

    controller = module.get<HabitsTrackerController>(HabitsTrackerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
