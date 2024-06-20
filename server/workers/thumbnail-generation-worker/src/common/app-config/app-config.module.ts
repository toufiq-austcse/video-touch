import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './service/app-config.service';


@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.env.PWD}/../../.env`,
      isGlobal: true
    })
  ],
  providers: [AppConfigService],
  exports: [AppConfigService]
})
export class AppConfigModule {
}