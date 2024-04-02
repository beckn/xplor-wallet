import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ApiClient } from 'src/common/api-client'
import { FileAccessControl, FileAccessControlSchema } from '../schemas/file-access-control.schema'
import { FileModel, FileSchema } from '../schemas/files.schema'
import { ShareRequestModel, ShareRequestSchema } from '../schemas/share-request.schema'
import { FileAccessControlService } from '../service/file-access-control.service'
import { FilesService } from '../service/files.service'
import { S3StorageModule } from './s3-storage.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FileAccessControl.name, schema: FileAccessControlSchema }]),
    MongooseModule.forFeature([{ name: ShareRequestModel, schema: ShareRequestSchema }]),
    MongooseModule.forFeature([{ name: FileModel, schema: FileSchema }]),
    ApiClient,
    S3StorageModule,
  ],
  providers: [FileAccessControlService, FilesService, ApiClient],
  exports: [FileAccessControlService, FileAccessControlService], // Export the service to be available in other modules
})
export class FileAccessControlModule {}
