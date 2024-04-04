import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import 'multer'
import { VcErrors } from 'src/common/constants/error-messages'
import { GetVCRequestDto } from '../dto/get-vc-request.dto'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'

@Injectable()
export class VerifiableCredentialDeleteService {
  constructor(@InjectModel('VerifiableCredential') private readonly vcModel: Model<VerifiableCredential>) {}

  /*
  This function takes all the details of the VC & Stores them
   **/
  async deleteVc(vcRequest: GetVCRequestDto): Promise<any> {
    const deletedVc = await this.vcModel.findOneAndDelete({ _id: vcRequest.vcId, walletId: vcRequest.walletId })

    if (!deletedVc) {
      throw new NotFoundException(VcErrors.VC_NOT_EXIST)
    }

    return deletedVc
  }
}
