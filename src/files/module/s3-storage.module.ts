import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3StorageService } from '../service/s3-storage.service'
import { GrafanaLoggerService } from '../../grafana/service/grafana.service'

@Module({
  providers: [S3StorageService, ConfigService, GrafanaLoggerService],
  exports: [S3StorageService],
})
export class S3StorageModule {}
