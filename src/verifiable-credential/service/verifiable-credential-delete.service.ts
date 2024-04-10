import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import 'multer'
import { VcErrors } from '../../common/constants/error-messages'
import { FilesDeleteService } from '../../files/service/files-delete.service'
import { GetVCRequestDto } from '../dto/get-vc-request.dto'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'

@Injectable()
export class VerifiableCredentialDeleteService {
  constructor(
    @InjectModel('VerifiableCredential') private readonly vcModel: Model<VerifiableCredential>,
    private readonly fileDeleteService: FilesDeleteService,
  ) {}

  /*
  This function takes all the details of the VC & Stores them
   **/
  async deleteVc(vcRequest: GetVCRequestDto): Promise<any> {
    const deletedVc = await this.vcModel.findOneAndDelete({ _id: vcRequest.vcId, walletId: vcRequest.walletId })
    const deletedFile = await this.fileDeleteService.deleteFileById(deletedVc['fileId'])
    if (!deletedVc || !deletedFile) {
      throw new NotFoundException(VcErrors.VC_NOT_EXIST)
    }

    return deletedVc
  }
}
