import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3StorageService } from '../service/s3-storage.service'
import { GrafanaLoggerService } from '../../grafana/service/grafana.service'
import { UrlShortenerUtil } from '../../utils/url-shortner.util'

@Module({
  providers: [
    S3StorageService,
    ConfigService,
    GrafanaLoggerService,
    {
      provide: UrlShortenerUtil,
      useFactory: (configService: ConfigService) => {
        return new UrlShortenerUtil(configService)
      },
      inject: [ConfigService],
    },
  ],
  exports: [S3StorageService],
})
export class S3StorageModule {}
