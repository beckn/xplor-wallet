import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ApiClient } from 'src/common/api-client'
import { WalletModule } from 'src/wallet/module/wallet.module'
import { WalletService } from 'src/wallet/service/wallet.service'
import { FilesController } from '../controller/files.controller'
import { FileAccessControlModel, FileAccessControlSchema } from '../schemas/file-access-control.schema'
import { FileModel, FileSchema } from '../schemas/files.schema'
import { ShareRequestModel, ShareRequestSchema } from '../schemas/share-request.schema'
import { FilesService } from '../service/files.service'
import { FileAccessControlModule } from './file-access-control.module'
import { S3StorageModule } from './s3-storage.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FileModel, schema: FileSchema }]),
    MongooseModule.forFeature([{ name: ShareRequestModel, schema: ShareRequestSchema }]),
    MongooseModule.forFeature([{ name: FileAccessControlModel, schema: FileAccessControlSchema }]),
    FileAccessControlModule,
    S3StorageModule,
    WalletModule,
    ApiClient,
  ],
  controllers: [FilesController],
  providers: [FilesService, FileAccessControlModule, WalletService, ApiClient],
  exports: [MongooseModule],
})
export class FilesModule {}
