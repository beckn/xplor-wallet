/*
Written by Bhaskar Kaura
Date: 22 March, 2024
*/

import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { SwaggerDocs } from './common/constants/api-documentation'

async function run() {
  const app = await NestFactory.create(AppModule, { cors: true })
  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix(SwaggerDocs.route)
  const config = new DocumentBuilder()
    .setTitle(SwaggerDocs.title)
    .setDescription(SwaggerDocs.description)
    .setVersion(SwaggerDocs.version)
    .addTag(SwaggerDocs.tag)
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup(SwaggerDocs.route, app, document)
  await app.listen(3000)
}

run()
