import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('DB URL ', configService.get('MONGO_DB_URL'));
        return {
          uri: configService.get('MONGO_DB_URL')
        };
      }
    })
  ]
})
export class DatabaseModule {
}
