// app.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { MulterModule } from '@nestjs/platform-express'
import { multerFileUploadConfig } from 'src/config/multer-file.config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ApiClient } from './common/api-client'
<<<<<<< HEAD
import configuration from './config/env/env.config'
=======
>>>>>>> develop
import { FileAccessControlModule } from './files/module/file-access-control.module'
import { FilesModule } from './files/module/files.module'
import { S3StorageModule } from './files/module/s3-storage.module'
import { VerifiableCredentialModule } from './verifiable-credential/module/verifiable-credential.module'
import { WalletModule } from './wallet/module/wallet.module'
<<<<<<< HEAD
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
=======

@Module({
  imports: [
    ConfigModule.forRoot(),
>>>>>>> develop
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
    ApiClient,
    MulterModule.register(multerFileUploadConfig),
    S3StorageModule,
    FileAccessControlModule,
    WalletModule,
    FilesModule,
    VerifiableCredentialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
