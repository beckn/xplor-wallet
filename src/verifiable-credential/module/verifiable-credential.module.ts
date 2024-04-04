import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ApiClient } from 'src/common/api-client'
import { S3StorageModule } from 'src/files/module/s3-storage.module'
import { FileModel, FileSchema } from 'src/files/schemas/files.schema'
import { FilesCreateService } from 'src/files/service/files-create.service'
import { FilesReadService } from 'src/files/service/files-read.service'
import { VCAccessControlModule } from 'src/vc-access-control/module/vc-access-control.module'
import { VCAccessControl, VCAccessControlSchema } from 'src/vc-access-control/schemas/file-access-control.schema'
import { VCAccessControlReadService } from 'src/vc-access-control/service/verifiable-credential-access-control-read.service'
import { WalletModule } from 'src/wallet/module/wallet.module'
import { WalletReadService } from 'src/wallet/service/wallet-read.service'
import { VerifiableCredentialController } from '../controller/verifiable-credental.controller'
import { VerifiableCredentialModel, VerifiableCredentialSchema } from '../schemas/verifiable-credential.schema'
import { VerifiableCredentialCreateService } from '../service/verifiable-credential-create.service'
import { VerifiableCredentialDeleteService } from '../service/verifiable-credential-delete.service'
import { VerifiableCredentialReadService } from '../service/verifiable-credential-read.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VerifiableCredentialModel, schema: VerifiableCredentialSchema }]),
    MongooseModule.forFeature([{ name: FileModel, schema: FileSchema }]),
    MongooseModule.forFeature([{ name: VCAccessControl.name, schema: VCAccessControlSchema }]),
    WalletModule,
    VCAccessControlModule,
    ApiClient,
    S3StorageModule,
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
  ],
  exports: [MongooseModule, VerifiableCredentialCreateService, VerifiableCredentialReadService],
})
export class VerifiableCredentialModule {}
