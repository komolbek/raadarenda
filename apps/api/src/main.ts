import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ResponseWrapperInterceptor } from './common/response-wrapper.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix('api');

  app.useGlobalInterceptors(new ResponseWrapperInterceptor());

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://rentevent.uz',
      'https://www.rentevent.uz',
      'https://admin.rentevent.uz',
      'https://api.rentevent.uz',
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('RentEvent API')
    .setDescription('RentEvent — rental platform API')
    .setVersion('2.0')
    .addBearerAuth()
    .addCookieAuth('admin_session')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`API running on port ${port}`);
}
bootstrap();
