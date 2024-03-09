import {Module} from '@nestjs/common';
import {IndexModule} from './index/index.module';
import {AppConfigModule} from '@common/app-config/app-config.module';
import {HttpClientsModule} from "@common/http-clients/http-clients.module";


@Module({
    imports: [HttpClientsModule, AppConfigModule, IndexModule],
    controllers: [],
    providers: []
})
export class ApiModule {

}
