import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api/api.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import morgan from 'morgan';
import { setupSwagger } from '@/src/common/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  app.enableCors({
    credentials: true,
    origin: true,
  });
  let PORT = +process.env.PORT || 3000;
  await setupSwagger(app, PORT);
  // pages.useGlobalFilters(new HttpExceptionFilter());
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
