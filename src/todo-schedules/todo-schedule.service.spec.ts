import { Test, TestingModule } from '@nestjs/testing';
import { TodoSchedulesService } from './todo-schedules.service';

describe('TodoSchedulesService', () => {
  let service: TodoSchedulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TodoSchedulesService],
    }).compile();

    service = module.get<TodoSchedulesService>(TodoSchedulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
