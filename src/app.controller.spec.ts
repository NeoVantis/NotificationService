import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return service status message', () => {
      expect(appController.getHello()).toBe(
        'NeoVantis Notification Service is running! Visit /info for service details or /api/v1/health for health status.',
      );
    });
  });
});
