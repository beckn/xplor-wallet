import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ApiClient } from 'src/common/api-client'
import { VCAccessControl, VCAccessControlSchema } from '../schemas/file-access-control.schema'
import { VCAccessControlUpdateService } from '../service/verifiable-credential-access-control-update.service'
import { VCAccessControlCreateService } from '../service/verifiable-credential-access-control.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: VCAccessControl.name, schema: VCAccessControlSchema }]), ApiClient],
  providers: [VCAccessControlCreateService, VCAccessControlUpdateService, ApiClient],
  exports: [VCAccessControlCreateService, VCAccessControlUpdateService], // Export the service to be available in other modules
})
export class VCAccessControlModule {}
