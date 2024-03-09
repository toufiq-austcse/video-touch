import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api/api.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import morgan from 'morgan';
import { setupSwagger } from '@common/swagger/index';


async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  let PORT = +process.env.PORT || 3000;
  await setupSwagger(app, PORT);
  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
  morgan.token('remote-addr', (req, res) => {
    let remoteAddr = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return remoteAddr.toString();
  });

  app.use(morgan(':remote-addr :method :url :status :res[content-length] - :response-time ms'));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
    })
  );
  await app.listen(PORT);
  Logger.log(await app.getUrl(), 'App URL');
}

bootstrap();
