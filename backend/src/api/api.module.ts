import { Module } from '@nestjs/common';
import { IndexModule } from './index/index.module';
import { AppConfigModule } from '@/src/common/app-config/app-config.module';
import { HttpClientsModule } from '@/src/common/http-clients/http-clients.module';
import { DatabaseModule } from '@/src/common/database/database.module';
import { VideosModule } from './videos/videos.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { RabbitMQModule } from '@/src/common/rabbit-mq/rabbit-mq.module';


@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    RabbitMQModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      cors: {
        origin: true,
        credentials: true
      },
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true
    }),
    HttpClientsModule,
    IndexModule,
    VideosModule
  ],
  controllers: [],
  providers: []
})
export class ApiModule {
}
