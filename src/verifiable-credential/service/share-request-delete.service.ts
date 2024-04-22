import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { FilesErrors, WalletErrors } from '../../common/constants/error-messages'
import { HttpResponseMessage } from '../../common/constants/http-response-message'
import { StandardMessageResponse } from '../../common/constants/standard-message-response.dto'
import { StandardWalletRequestDto } from '../../files/dto/standard-wallet-request.dto'
import { getSuccessResponse } from '../../utils/get-success-response'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { ShareRequest } from '../schemas/share-request.schema'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'
import { VCAccessControlUpdateService } from '../../vc-access-control/service/verifiable-credential-access-control-update.service'

@Injectable()
export class ShareRequestDeleteService {
  constructor(
    @InjectModel('VerifiableCredential') private readonly vcModel: Model<VerifiableCredential>,
    @InjectModel('ShareRequest') private readonly shareRequestModel: Model<ShareRequest>,
    private readonly walletReadService: WalletReadService,
    private readonly vcAclUpdateService: VCAccessControlUpdateService,
  ) {}

  /**
   * Deletes File share request
   * Only the request owner (who made the request), can deleted it
   */
  async deleteShareRequest(walletId: string, requestId: string): Promise<StandardMessageResponse | any> {
    const wallet = await this.walletReadService.getWalletDetails(new StandardWalletRequestDto(null, walletId))
    if (!wallet['data']) {
      throw new NotFoundException(WalletErrors.WALLET_NOT_FOUND)
    }

    const requestDetails = await this.shareRequestModel.findById(requestId)

    if (requestDetails == null) {
      throw new NotFoundException(FilesErrors.REQUEST_NOT_FOUND)
    }

    if (requestDetails['raisedByWallet'] != walletId) {
      throw new UnauthorizedException(FilesErrors.REQUEST_DELETE_PERMISSION_ERROR)
    }

    const result = await this.shareRequestModel.findOneAndDelete({ _id: requestId })
    await this.vcAclUpdateService.deleteAclByRestrictedUrl(result['restrictedUrl'])
    return getSuccessResponse(await result, HttpResponseMessage.OK)
  }

  /**
   * Deletes all the File share request associated with the Verifiable Credential
   */
  async deleteShareRequestsByVcId(vcId: string): Promise<StandardMessageResponse | any> {
    const result = await this.shareRequestModel.deleteMany({ vcId })
    return getSuccessResponse(await result, HttpResponseMessage.OK)
  }
}
