import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ShareRequestAction } from '../../common/constants/enums'
import { FilesErrors, WalletErrors } from '../../common/constants/error-messages'
import { HttpResponseMessage } from '../../common/constants/http-response-message'
import { StandardMessageResponse } from '../../common/constants/standard-message-response.dto'
import { StandardWalletRequestDto } from '../../files/dto/standard-wallet-request.dto'
import { FilesReadService } from '../../files/service/files-read.service'
import { getSuccessResponse } from '../../utils/get-success-response'
import { generateVCAccessControlExpirationTimestamp } from '../../utils/vc.utils'
import { VCAccessControlCreateService } from '../../vc-access-control/service/verifiable-credential-access-control-create.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { ShareRequest } from '../schemas/share-request.schema'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'
import { VerifiableCredentialReadService } from './verifiable-credential-read.service'

@Injectable()
export class ShareRequestUpdateService {
  constructor(
    @InjectModel('VerifiableCredential') private readonly vcModel: Model<VerifiableCredential>,
    @InjectModel('ShareRequest') private readonly shareRequestModel: Model<ShareRequest>,
    private readonly vcReadService: VerifiableCredentialReadService,
    private readonly vcAclCreateService: VCAccessControlCreateService,
    private readonly filesReadService: FilesReadService,
    private readonly walletReadService: WalletReadService,
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

    return getSuccessResponse(await result, HttpResponseMessage.OK)
  }

  /**
   * ACCEPTS, REJECTS the VC ShareRequest
   * if ACCEPTED:
   * Stores the ACL RestrictedUrl in ShareRequest's VcUrl
   */
  async respondToShareRequest(
    walletId: string,
    requestId: string,
    vcId: string,
    action: ShareRequestAction | string,
  ): Promise<StandardMessageResponse | any> {
    const wallet = await this.walletReadService.getWalletDetails(new StandardWalletRequestDto(null, walletId))

    if (!wallet['data']) {
      throw new NotFoundException(WalletErrors.WALLET_NOT_FOUND)
    }

    if (
      action != ShareRequestAction.ACCEPTED &&
      action != ShareRequestAction.REJECTED &&
      action != ShareRequestAction.PENDING
    ) {
      throw new BadRequestException(FilesErrors.INVALID_ACTION)
    }

    const requestDetails = await this.shareRequestModel.findOne({ _id: requestId })
    const vcDetails = await this.vcReadService.getVCById(vcId)

    if (requestDetails == null) {
      throw new NotFoundException(FilesErrors.REQUEST_NOT_FOUND)
    }

    if (vcDetails == null) {
      throw new NotFoundException(FilesErrors.FILE_NOT_EXIST)
    }

    if (requestDetails['vcOwnerWallet'] != walletId) {
      throw new UnauthorizedException(FilesErrors.SHARE_ACTION_PERMISSION_ERROR)
    }

    let actionResult = {}
    if (action == ShareRequestAction.REJECTED) {
      actionResult = await this.shareRequestModel.findOneAndUpdate(
        { _id: requestId },
        {
          status: action,
          vcId: '',
          restrictedUrl: '',
        },
        { new: true },
      )
    } else if (action == ShareRequestAction.ACCEPTED) {
      // Here if the action is ACCEPTED, then set the fileId and generate the restrictedUrl in the shareRequestModel
      // Create an ACL document
      const restrictedFile = await this.vcAclCreateService.createVcAccessControl(
        vcId,
        requestId,
        generateVCAccessControlExpirationTimestamp(requestDetails['vcShareDetails']['restrictions']['expiresIn']),
        requestDetails['vcShareDetails']['restrictions']['viewOnce'],
      )

      if (!restrictedFile) {
        throw new NotFoundException(FilesErrors.INTERNAL_ERROR)
      }

      // Update the shareRequest with the fileId, status and fileShareUrl

      actionResult = await this.shareRequestModel
        .findOneAndUpdate(
          { _id: requestId },
          {
            status: action,
            vcId: vcId,
            restrictedUrl: restrictedFile['restrictedUrl'],
          },
          { new: true },
        )
        .exec()
    }

    if (actionResult == null) {
      throw new InternalServerErrorException(FilesErrors.INTERNAL_ERROR)
    }

    return getSuccessResponse(await actionResult, HttpResponseMessage.OK)
  }
}
