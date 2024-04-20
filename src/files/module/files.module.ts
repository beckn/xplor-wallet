import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ApiClient } from '../../common/api-client'
import { VCAccessControlModule } from '../../vc-access-control/module/vc-access-control.module'
import { VerifiableCredentialModule } from '../../verifiable-credential/module/verifiable-credential.module'
import { WalletModule } from '../../wallet/module/wallet.module'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
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
