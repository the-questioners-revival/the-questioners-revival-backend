import { Test, TestingModule } from '@nestjs/testing';
import { ActivityCalendarController } from './activity-calendar.controller';

describe('ActivityCalendarController', () => {
  let controller: ActivityCalendarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityCalendarController],
    }).compile();

    controller = module.get<ActivityCalendarController>(ActivityCalendarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
