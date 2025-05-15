import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { VersioningType } from '@nestjs/common';
// import { createAppLogger } from './infrastructure/logger/logger.config';
import { ConfigService } from './infrastructure/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false,
  });

  // Security middleware
  app.use(helmet());
  app.enableCors();

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('URL Shortener API')
    .setDescription('The URL Shortener API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('urls', 'URL shortening operations')
    .addTag('analytics', 'URL analytics operations')
    .addTag('health', 'Health check operations')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  await app.listen(configService.getNumber('PORT'));
}
bootstrap();
