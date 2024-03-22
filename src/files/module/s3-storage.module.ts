import { Module } from '@nestjs/common'
<<<<<<< HEAD
import { ConfigService } from '@nestjs/config'
import { S3StorageService } from '../service/s3-storage.service'

@Module({
  providers: [S3StorageService, ConfigService],
=======
import { S3StorageService } from '../service/s3-storage.service'

@Module({
  providers: [S3StorageService],
>>>>>>> develop
  exports: [S3StorageService],
})
export class S3StorageModule {}
