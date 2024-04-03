import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ApiClient } from 'src/common/api-client'
import { FilesService } from 'src/files/service/files.service'
import { WalletModule } from 'src/wallet/module/wallet.module'
import { WalletReadService } from 'src/wallet/service/wallet-read.service'
import { VerifiableCredentialController } from '../controller/verifiable-credental.controller'
import { VerifiableCredentialModel, VerifiableCredentialSchema } from '../schemas/verifiable-credential.schema'
import { VerifiableCredentialCreateService } from '../service/verifiable-credential-create.service'
import { VerifiableCredentialReadService } from '../service/verifiable-credential-read.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VerifiableCredentialModel, schema: VerifiableCredentialSchema }]),
    WalletModule,
    ApiClient,
  ],
  controllers: [VerifiableCredentialController],
  providers: [
    FilesService,
    WalletReadService,
    ApiClient,
    VerifiableCredentialCreateService,
    VerifiableCredentialReadService,
  ],
  exports: [MongooseModule],
})
export class VerifiableCredentialModule {}
