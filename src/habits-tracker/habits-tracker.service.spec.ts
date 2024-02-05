import { Test, TestingModule } from '@nestjs/testing';
import { HabitsTrackerService } from './habits-tracker.service';

describe('HabitsTrackerService', () => {
  let service: HabitsTrackerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HabitsTrackerService],
    }).compile();

    service = module.get<HabitsTrackerService>(HabitsTrackerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
