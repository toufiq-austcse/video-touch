import { Module } from '@nestjs/common';
import { IndexModule } from './index/index.module';
import { AppConfigModule } from '@/src/common/app-config/app-config.module';
import { HttpClientsModule } from '@/src/common/http-clients/http-clients.module';
import { DatabaseModule } from '@/src/common/database/database.module';
import { AssetsModule } from '@/src/api/assets/assets.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AwsModule } from '@/src/common/aws/aws.module';
import { AuthModule } from './auth/auth.module';
import { BullModule } from '@nestjs/bullmq';
import { RabbitMQModule } from '@/src/common/rabbit-mq/rabbit-mq.module';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    RabbitMQModule,
    BullModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: () => ({
        connection: {
          host: AppConfigService.appConfig.REDIS_HOST,
          port: AppConfigService.appConfig.REDIS_PORT,
        },
      }),
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter, // Or FastifyAdapter from `@bull-board/fastify`
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      cors: {
        origin: true,
        credentials: true,
      },
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
    }),
    HttpClientsModule,
    IndexModule,
    AssetsModule,
    AwsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
