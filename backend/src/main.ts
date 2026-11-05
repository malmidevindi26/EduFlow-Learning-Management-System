import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({ origin: 'http://localhost:3000', credentials: true })
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true}))

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' })

  const config = new DocumentBuilder()
     .setTitle('EduFlow LMS API')
     .setDescription('REST API for the EduFlow Learning Management System')
     .setVersion('1.0')
     .addBearerAuth()
     .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}/api`)
  console.log(`Swagger docs on http://localhost:${port}/docs`);

}
bootstrap();
