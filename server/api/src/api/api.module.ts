import { AssetsModule } from '@/src/api/assets/assets.module';
import { AppConfigModule } from '@/src/common/app-config/app-config.module';
import { AppConfigService } from '@/src/common/app-config/service/app-config.service';
import { AwsModule } from '@/src/common/aws/aws.module';
import { DatabaseModule } from '@/src/common/database/database.module';
import { HttpClientsModule } from '@/src/common/http-clients/http-clients.module';
import { RabbitMQModule } from '@/src/common/rabbit-mq/rabbit-mq.module';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { ApolloDriver } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { IndexModule } from './index/index.module';
import { WebhookModule } from './webhook/webhook.module';

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
    GraphQLModule.forRoot<any>({
      cors: {
        origin: true,
        credentials: true,
      },
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      graphiql: true,
    }),
    HttpClientsModule,
    IndexModule,
    AssetsModule,
    AwsModule,
    AuthModule,
    WebhookModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
