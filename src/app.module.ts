import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { MulterModule } from '@nestjs/platform-express'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ApiClient } from './common/api-client'
import configuration from './config/env/env.config'
import { multerFileUploadConfig } from './config/multer-file.config'
import { FilesModule } from './files/module/files.module'
import { S3StorageModule } from './files/module/s3-storage.module'
import { VCAccessControlModule } from './vc-access-control/module/vc-access-control.module'
import { VerifiableCredentialModule } from './verifiable-credential/module/verifiable-credential.module'
import { WalletModule } from './wallet/module/wallet.module'
import { LoggingInterceptor } from './utils/logger-interceptor'
import { GrafanaLoggerService } from './grafana/service/grafana.service'
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
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
    VerifiableCredentialModule,
    WalletModule,
    FilesModule,
    VCAccessControlModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    GrafanaLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
