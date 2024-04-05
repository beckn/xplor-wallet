import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import 'multer'
import { VcErrors } from 'src/common/constants/error-messages'
import { MaxVCShareHours } from 'src/common/constants/vc-constants'
import { generateVCAccessControlExpirationTimestamp } from 'src/utils/vc.utils'
import { VCAccessControlUpdateService } from 'src/vc-access-control/service/verifiable-credential-access-control-update.service'
import { VCAccessControlCreateService } from '../../vc-access-control/service/verifiable-credential-access-control-create.service'
import { CreateVCRequestBodyDto } from '../dto/create-vc-request-body.dto'
import { CreateVCRequestModelDto } from '../dto/create-vc-request-model.dto'
import { PushVCRequestBodyDto } from '../dto/push-vc-request-body.dto'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'

@Injectable()
export class VerifiableCredentialCreateService {
  constructor(
    @InjectModel('VerifiableCredential') private readonly vcModel: Model<VerifiableCredential>,
    private readonly vcAclCreateService: VCAccessControlCreateService,
    private readonly vcAclUpdateService: VCAccessControlUpdateService,
  ) {}

  /*
  This function takes all the details of the VC & Stores them
   **/
  async createVerifiableCredential(vcRequest: CreateVCRequestBodyDto): Promise<any> {
    // Generate an ACL For this vc
    const vcAclDetails = await this.vcAclCreateService.createVcAccessControl(
      'vcId', // Need to update this once the fileId is made,
      '',
      generateVCAccessControlExpirationTimestamp(MaxVCShareHours),
      false,
    )
    if (vcAclDetails == null) {
      throw new InternalServerErrorException(VcErrors.ACL_GENERATION_ERROR)
    }

    const vcSaveRequest = new CreateVCRequestModelDto(
      vcRequest.did,
      vcRequest.fileId,
      vcRequest.walletId,
      vcRequest.type,
      vcRequest.category,
      vcRequest.templateId,
      vcRequest.tags,
      vcRequest.name,
      vcAclDetails['restrictedUrl'],
    )

    const createdVc = new this.vcModel(vcSaveRequest)
    const fileResult = await createdVc.save()

    // Updated VcId in ACL Document
    await this.vcAclUpdateService.updateVcIdByRestrictedKey(vcAclDetails['restrictedKey'], fileResult['_id'].toString())
    return fileResult
  }

  /*
  This function takes all the details of the VC & Stores them
   **/
  async pushVerifiableCredential(vcRequest: PushVCRequestBodyDto): Promise<any> {
    // Generate an ACL For this vc
    const vcAclDetails = await this.vcAclCreateService.createVcAccessControl(
      'vcId', // Need to update this once the fileId is made,
      '',
      generateVCAccessControlExpirationTimestamp(MaxVCShareHours),
      false,
    )
    if (vcAclDetails == null) {
      throw new InternalServerErrorException(VcErrors.ACL_GENERATION_ERROR)
    }

    const vcSaveRequest = new CreateVCRequestModelDto(
      vcRequest.did,
      null,
      vcRequest.walletId,
      vcRequest.type,
      vcRequest.category,
      vcRequest.templateId,
      vcRequest.tags,
      vcRequest.name,
      vcAclDetails['restrictedUrl'],
    )

    const createdVc = new this.vcModel(vcSaveRequest)
    const fileResult = await createdVc.save()

    // Updated VcId in ACL Document
    await this.vcAclUpdateService.updateVcIdByRestrictedKey(vcAclDetails['restrictedKey'], fileResult['_id'].toString())
    return fileResult
  }
}
