import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function run() {
  const app = await NestFactory.create(AppModule, { cors: true })
  app.setGlobalPrefix('api/v1')
  const config = new DocumentBuilder()
    .setTitle('Xplor Wallet')
    .setDescription('Wallet layer for Xplore to store, add, share files.')
    .setVersion('1.0')
    .addTag('Wallet')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/v1', app, document)
  await app.listen(3000)
}

run()
