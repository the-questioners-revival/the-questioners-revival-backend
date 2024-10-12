import { Test, TestingModule } from '@nestjs/testing';
import { ActivityCalendarService } from './activity-calendar.service';

describe('ActivityCalendarService', () => {
  let service: ActivityCalendarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityCalendarService],
    }).compile();

    service = module.get<ActivityCalendarService>(ActivityCalendarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
