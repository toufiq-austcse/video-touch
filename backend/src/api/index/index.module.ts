import { Module } from '@nestjs/common';
import { IndexController } from './controller/index.controller';

@Module({
  controllers: [IndexController]
})
export class IndexModule {
}
