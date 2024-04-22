import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { FileShareType, ShareRequestAction } from '../../common/constants/enums'
import { VcErrors, WalletErrors } from '../../common/constants/error-messages'
import { HttpResponseMessage } from '../../common/constants/http-response-message'
import { StandardWalletRequestDto } from '../../files/dto/standard-wallet-request.dto'
import { FilesReadService } from '../../files/service/files-read.service'
import { getSuccessResponse } from '../../utils/get-success-response'
import { GetShareFileRequestsDto } from '../../verifiable-credential/dto/get-share-file-request-list.dto'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { ShareRequest } from '../schemas/share-request.schema'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'

@Injectable()
export class ShareRequestReadService {
  constructor(
    @InjectModel('VerifiableCredential') private readonly vcModel: Model<VerifiableCredential>,
    @InjectModel('ShareRequest') private readonly shareRequestModel: Model<ShareRequest>,
    private readonly walletReadService: WalletReadService,
    private readonly filesReadService: FilesReadService,
  ) {}

  /**
   * Returns the list of all the file share requests made by user or received from someone
   */
  async getShareRequestsList(walletId: string, queries: GetShareFileRequestsDto): Promise<any> {
    const wallet = await this.walletReadService.getWalletDetails(new StandardWalletRequestDto(null, walletId))

    if (!wallet['data']) {
      throw new NotFoundException(WalletErrors.WALLET_NOT_FOUND)
    }

    const filter: any = {
      $or: [{ raisedByWallet: walletId }, { vcOwnerWallet: walletId }],
    }

    if (queries.shareType === FileShareType.RECEIVED) {
      filter.$and = [{ raisedByWallet: { $ne: queries.walletId } }]
    } else {
      filter.$and = [{ raisedByWallet: queries.walletId }]
    }

    if (queries.documentType) {
      filter.$and = filter.$and || []
      filter.$and.push({ 'vcShareDetails.certificateType': queries.documentType })
    }

    if (queries.status != null) {
      filter.$and.push({ status: queries.status })
    }

    let query = this.shareRequestModel.find(filter)

    // Sort by updatedAt date field
    query = query.sort({ updatedAt: -1 })

    // Pagination
    const page = queries.page || 1
    const pageSize = queries.pageSize || 20
    const skip = (page - 1) * pageSize

    // Apply pagination
    query = query.skip(skip).limit(pageSize)

    const shareRequests = await query

    const updatedShareRequests = []

    for (const request of shareRequests) {
      const updatedRequest = { ...request['_doc'] }

      if (request.vcId && request.status === ShareRequestAction.ACCEPTED) {
        const vcDetails = await this.vcModel.findOne({ _id: request['vcId'] })
        if (vcDetails != null) {
          if (vcDetails['fileId'] != null) {
            const fileDetails = await this.filesReadService.getFileByIdWithoutStoredUrl(vcDetails['fileId'])
            if (fileDetails != null) {
              updatedRequest['fileDetails'] = fileDetails
            }
          }

          updatedRequest['vcDetails'] = vcDetails
        }
      }

      updatedShareRequests.push(updatedRequest)
    }

    return getSuccessResponse(await updatedShareRequests, HttpResponseMessage.OK)
  }

  async getShareRequestsById(requestId: string): Promise<any> {
    const shareRequest = await this.shareRequestModel.findOne({ _id: requestId })

    if (!shareRequest) {
      throw new NotFoundException(VcErrors.SHARE_REQUEST_NOT_FOUND)
    }

    return shareRequest
  }
}
