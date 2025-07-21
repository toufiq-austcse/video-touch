import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api/api.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import morgan from 'morgan';
import { setupSwagger } from '@/src/common/swagger';
import { HttpExceptionFilter } from '@/src/common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  app.enableCors({
    credentials: true,
    origin: true,
  });
  let PORT = +process.env.API_PORT || 3000;
  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix('api');
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
      transform: true,
    })
  );

  await app.listen(PORT);

  Logger.log(await app.getUrl(), 'App URL');
}

bootstrap();
