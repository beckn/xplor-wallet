import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import 'multer'
import { VcErrors, WalletErrors } from '../../common/constants/error-messages'
import { HttpResponseMessage } from '../../common/constants/http-response-message'
import { StandardWalletRequestDto } from '../../files/dto/standard-wallet-request.dto'
import { FilesDeleteService } from '../../files/service/files-delete.service'
import { getSuccessResponse } from '../../utils/get-success-response'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { GetVCRequestDto } from '../dto/get-vc-request.dto'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'

@Injectable()
export class VerifiableCredentialDeleteService {
  constructor(
    @InjectModel('VerifiableCredential') private readonly vcModel: Model<VerifiableCredential>,
    private readonly fileDeleteService: FilesDeleteService,
    private readonly walletReadService: WalletReadService,
  ) {}

  /*
  This function takes all the details of the VC & Stores them
   **/
  async deleteVc(vcRequest: GetVCRequestDto): Promise<any> {
    const wallet = await this.walletReadService.getWalletDetails(new StandardWalletRequestDto(null, vcRequest.walletId))

    if (!wallet['data']) {
      throw new NotFoundException(WalletErrors.WALLET_NOT_FOUND)
    }

    const deletedVc = await this.vcModel.findOneAndDelete({ _id: vcRequest.vcId, walletId: vcRequest.walletId })
    const deletedFile = await this.fileDeleteService.deleteFileById(deletedVc['fileId'])
    if (!deletedVc || !deletedFile) {
      throw new NotFoundException(VcErrors.VC_NOT_EXIST)
    }

    return getSuccessResponse(await deletedVc, HttpResponseMessage.OK)
  }
}
