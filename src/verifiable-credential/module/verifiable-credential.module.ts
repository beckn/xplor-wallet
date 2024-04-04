import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ApiClient } from 'src/common/api-client'
import { S3StorageModule } from 'src/files/module/s3-storage.module'
import { FileModel, FileSchema } from 'src/files/schemas/files.schema'
import { FilesCreateService } from 'src/files/service/files-create.service'
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
    WalletModule,
    S3StorageModule,
    ApiClient,
  ],
  controllers: [VerifiableCredentialController],
  providers: [
    FilesCreateService,
    WalletReadService,
    ApiClient,
    VerifiableCredentialCreateService,
    VerifiableCredentialReadService,
    VerifiableCredentialDeleteService,
  ],
  exports: [MongooseModule, VerifiableCredentialCreateService, VerifiableCredentialReadService],
})
export class VerifiableCredentialModule {}
