import { Global, Module } from '@nestjs/common';
import dataSource from 'ormconfig';
import { DataSource } from 'typeorm';

@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      useFactory: async () => {
        await dataSource.initialize();
      }
    }

  ],
  exports: [DataSource]
})
export class DatabaseModule {
}
