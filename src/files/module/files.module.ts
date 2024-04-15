import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ApiClient } from 'src/common/api-client'
import { VCAccessControlModule } from 'src/vc-access-control/module/vc-access-control.module'
import { VerifiableCredentialModule } from 'src/verifiable-credential/module/verifiable-credential.module'
import { WalletModule } from 'src/wallet/module/wallet.module'
import { WalletReadService } from 'src/wallet/service/wallet-read.service'
import { FilesController } from '../controller/files.controller'
import { FileModel, FileSchema } from '../schemas/files.schema'
import { FilesCreateService } from '../service/files-create.service'
import { FilesDeleteService } from '../service/files-delete.service'
import { FilesReadService } from '../service/files-read.service'
import { FilesUpdateService } from '../service/files-update.service'
import { S3StorageModule } from './s3-storage.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FileModel, schema: FileSchema }]),
    S3StorageModule,
    VerifiableCredentialModule,
    WalletModule,
    ApiClient,
    VCAccessControlModule,
  ],
  controllers: [FilesController],
  providers: [
    FilesCreateService,
    WalletReadService,
    FilesReadService,
    FilesDeleteService,
    FilesUpdateService,
    ApiClient,
  ],
  exports: [MongooseModule, FilesCreateService, FilesReadService, FilesDeleteService, FilesUpdateService],
})
export class FilesModule {}
