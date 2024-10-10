import { Test, TestingModule } from '@nestjs/testing';
import { TodoSchedulesController } from './todo-schedules.controller';

describe('TodoSchedulesController', () => {
  let controller: TodoSchedulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoSchedulesController],
    }).compile();

    controller = module.get<TodoSchedulesController>(TodoSchedulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
