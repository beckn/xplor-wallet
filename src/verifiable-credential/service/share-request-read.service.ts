import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ShareRequestAction } from '../../common/constants/enums'
import { VcErrors } from '../../common/constants/error-messages'
import { GetShareFileRequestsDto } from '../../verifiable-credential/dto/get-share-file-request-list.dto'
import { ShareRequest } from '../schemas/share-request.schema'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'

@Injectable()
export class ShareRequestReadService {
  constructor(
    @InjectModel('VerifiableCredential') private readonly vcModel: Model<VerifiableCredential>,
    @InjectModel('ShareRequest') private readonly shareRequestModel: Model<ShareRequest>,
  ) {}

  /**
   * Returns the list of all the file share requests made by user or received from someone
   */
  async getShareRequestsList(walletId: string, queries: GetShareFileRequestsDto): Promise<any> {
    const filter: any = {
      $or: [{ raisedByWallet: walletId }, { vcOwnerWallet: walletId }],
    }

    if (queries.status) {
      filter.$and = [{ status: queries.status }]
    }

    if (queries.documentType) {
      filter.$and = filter.$and || []
      filter.$and.push({ 'fileShareDetails.documentType': queries.documentType })
    }

    const shareRequests = await this.shareRequestModel.find(filter)

    const updatedShareRequests = []

    for (const request of shareRequests) {
      const updatedRequest = { ...request['_doc'] }

      if (request.vcId && request.status === ShareRequestAction.ACCEPTED) {
        const vcDetails = await this.vcModel.findOne({ _id: request['vcId'] })
        if (vcDetails != null) {
          updatedRequest['vcDetails'] = vcDetails
        }
      }

      updatedShareRequests.push(updatedRequest)
    }

    if (updatedShareRequests.length < 1) {
      throw new NotFoundException(VcErrors.VCs_NOT_FOUND)
    }

    return updatedShareRequests
  }

  async getShareRequestsById(requestId: string): Promise<any> {
    const shareRequest = await this.shareRequestModel.findOne({ _id: requestId })

    if (!shareRequest) {
      throw new NotFoundException(VcErrors.SHARE_REQUEST_NOT_FOUND)
    }

    return shareRequest
  }
}
