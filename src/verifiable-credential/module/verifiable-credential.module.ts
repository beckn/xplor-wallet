import { Module } from '@nestjs/common'
import { ApiClient } from 'src/common/api-client'
import { FileAccessControlModule } from 'src/files/module/file-access-control.module'
import { FilesModule } from 'src/files/module/files.module'
import { S3StorageModule } from 'src/files/module/s3-storage.module'
import { FilesService } from 'src/files/service/files.service'
import { VerifiableCredentialController } from '../controller/verifiable-credential.controller'
import { UserDidService } from '../service/user-did.service'
import { VerifiableCredentialService } from '../service/verifiable-credential.service'

@Module({
  imports: [ApiClient, FilesModule, FileAccessControlModule, S3StorageModule],
  controllers: [VerifiableCredentialController],
  providers: [VerifiableCredentialService, UserDidService, ApiClient, FilesService],
})
export class VerifiableCredentialModule {}
