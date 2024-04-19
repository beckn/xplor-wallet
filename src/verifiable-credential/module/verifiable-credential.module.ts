import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ApiClient } from '../../common/api-client'
import { S3StorageModule } from '../../files/module/s3-storage.module'
import { FileModel, FileSchema } from '../../files/schemas/files.schema'
import { FilesCreateService } from '../../files/service/files-create.service'
import { FilesDeleteService } from '../../files/service/files-delete.service'
import { FilesReadService } from '../../files/service/files-read.service'
import { FilesUpdateService } from '../../files/service/files-update.service'
import { RedisModule } from '../../redis/module/redis.module'
import { VCAccessControlModule } from '../../vc-access-control/module/vc-access-control.module'
import { VCAccessControl, VCAccessControlSchema } from '../../vc-access-control/schemas/file-access-control.schema'
import { VCAccessControlReadService } from '../../vc-access-control/service/verifiable-credential-access-control-read.service'
import { VCAccessControlUpdateService } from '../../vc-access-control/service/verifiable-credential-access-control-update.service'
import { WalletModule } from '../../wallet/module/wallet.module'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { VerifiableCredentialController } from '../controller/verifiable-credential.controller'
import { ShareRequest, ShareRequestSchema } from '../schemas/share-request.schema'
import { VerifiableCredentialModel, VerifiableCredentialSchema } from '../schemas/verifiable-credential.schema'
import { ShareRequestCreateService } from '../service/share-request-create.service'
import { ShareRequestReadService } from '../service/share-request-read.service'
import { ShareRequestUpdateService } from '../service/share-request-update.service'
import { VerifiableCredentialCreateService } from '../service/verifiable-credential-create.service'
import { VerifiableCredentialDeleteService } from '../service/verifiable-credential-delete.service'
import { VerifiableCredentialReadService } from '../service/verifiable-credential-read.service'
import { ShareRequestDeleteService } from '../service/share-request-delete.service'
import { ConfigService } from 'aws-sdk'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VerifiableCredentialModel, schema: VerifiableCredentialSchema }]),
    MongooseModule.forFeature([{ name: FileModel, schema: FileSchema }]),
    MongooseModule.forFeature([{ name: VCAccessControl.name, schema: VCAccessControlSchema }]),
    MongooseModule.forFeature([{ name: ShareRequest.name, schema: ShareRequestSchema }]),
    WalletModule,
    VCAccessControlModule,
    ApiClient,
    S3StorageModule,
    RedisModule,
    ConfigService,
  ],
  controllers: [VerifiableCredentialController],
  providers: [
    FilesCreateService,
    WalletReadService,
    ApiClient,
    VerifiableCredentialCreateService,
    VerifiableCredentialReadService,
    VerifiableCredentialDeleteService,
    VCAccessControlReadService,
    FilesReadService,
    FilesDeleteService,
    FilesUpdateService,
    VCAccessControlUpdateService,
    ShareRequestReadService,
    ShareRequestUpdateService,
    ShareRequestCreateService,
    ShareRequestDeleteService,
    WalletReadService,
  ],
  exports: [
    MongooseModule,
    VerifiableCredentialCreateService,
    VerifiableCredentialReadService,
    ShareRequestReadService,
    ShareRequestCreateService,
    ShareRequestUpdateService,
    ShareRequestDeleteService,
    VerifiableCredentialCreateService,
    VerifiableCredentialDeleteService,
    VCAccessControlReadService,
    FilesReadService,
    FilesDeleteService,
    FilesUpdateService,
    WalletReadService,
    ConfigService,
  ],
})
export class VerifiableCredentialModule {}
