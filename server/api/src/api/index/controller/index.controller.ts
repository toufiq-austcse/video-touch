import { Controller, Get } from '@nestjs/common';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';

@Controller()
export class IndexController {
  constructor() {
  }

  @Get()
  async index() {
    return {
      app: `${AppConfigService.appConfig.APP_NAME} is running...`
    };
  }
}
