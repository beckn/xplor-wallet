import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ShareRequestAction } from 'src/common/constants/enums'
import { FilesErrors, VcErrors } from 'src/common/constants/error-messages'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { FilesReadService } from 'src/files/service/files-read.service'
import { generateVCAccessControlExpirationTimestamp } from 'src/utils/vc.utils'
import { VCAccessControlCreateService } from 'src/vc-access-control/service/verifiable-credential-access-control-create.service'
import { VCAccessControlUpdateService } from 'src/vc-access-control/service/verifiable-credential-access-control-update.service'
import {
  CreateShareFileRequestDto,
  Restrictions,
  VcShareDetails,
} from 'src/verifiable-credential/dto/create-share-file-request.dto'
import { RequestShareFileRequestDto } from 'src/verifiable-credential/dto/request-share-file-request.dto'
import { ShareFileRequestDto } from 'src/verifiable-credential/dto/share-file-request.dto'
import { ShareRequest } from '../schemas/share-request.schema'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'
import { VerifiableCredentialReadService } from './verifiable-credential-read.service'

@Injectable()
export class ShareRequestCreateService {
  constructor(
    @InjectModel('VerifiableCredential') private readonly vcModel: Model<VerifiableCredential>,
    @InjectModel('ShareRequest') private readonly shareRequestModel: Model<ShareRequest>,
    private readonly vcReadService: VerifiableCredentialReadService,
    private readonly vcAclUpdateService: VCAccessControlUpdateService,
    private readonly vcAclCreateService: VCAccessControlCreateService,
    private readonly filesReadService: FilesReadService,
  ) {}

  /**
   * Creates a file share record to share with anyone
   * Signs the fileUrl of the AWS File
   * Creates ACL Record for it
   * Updates Acl record with file share request id
   */
  async shareVc(
    vcId: string,
    walletId: string,
    shareRequest: ShareFileRequestDto,
  ): Promise<StandardMessageResponse | any> {
    const vcDetails = await this.vcReadService.getVCById(vcId)
    const fileDetails = await this.filesReadService.getFileById(vcDetails['fileId'])
    if (vcDetails == null) {
      throw new NotFoundException(VcErrors.VC_NOT_EXIST)
    }

    if (vcDetails != null) {
      if (vcDetails['walletId'] != walletId) {
        throw new UnauthorizedException(FilesErrors.SHARE_PERMISSION_ERROR)
      }
    }

    const expiryTimeStamp = generateVCAccessControlExpirationTimestamp(shareRequest.restrictions.expiresIn)

    const restrictedFile = await this.vcAclCreateService.createVcAccessControl(
      vcId,
      '',
      fileDetails['storedUrl'],
      expiryTimeStamp,
      shareRequest.restrictions.viewOnce,
    )
    if (restrictedFile == null) {
      throw new InternalServerErrorException(VcErrors.ACL_GENERATION_ERROR)
    }

    const fileShareDetails = new VcShareDetails(
      shareRequest.certificateType,
      new Restrictions(shareRequest.restrictions.expiresIn, shareRequest.restrictions.viewOnce),
    )
    const createFileShareRequestDto = new CreateShareFileRequestDto(
      vcId,
      ShareRequestAction.ACCEPTED,
      restrictedFile.restrictedUrl,
      walletId,
      vcDetails['walletId'],
      fileShareDetails,
    )
    const shareRequestModel = new this.shareRequestModel(createFileShareRequestDto)
    const result = await shareRequestModel.save()

    await this.vcAclUpdateService.updateShareRequestIdByRestrictedKey(
      restrictedFile.restrictedKey,
      result['_id'].toString(),
    )
    if (result) {
      return result
    } else {
      throw new NotFoundException(FilesErrors.FILES_NOT_FOUND)
    }
  }

  /**
   * Requests to share a file of a documentType from given userId
   */
  async requestShareFile(
    walletId: string,
    shareRequest: RequestShareFileRequestDto,
  ): Promise<StandardMessageResponse | any> {
    if (shareRequest.restrictions.expiresIn > 168) {
      throw new BadRequestException(FilesErrors.FILE_MAX_TIME_LIMIT_ERROR)
    }

    const fileShareDetails = new VcShareDetails(
      shareRequest.certificateType,
      new Restrictions(shareRequest.restrictions.expiresIn, shareRequest.restrictions.viewOnce),
    )

    const createFileShareRequestDto = new CreateShareFileRequestDto(
      'vcId',
      ShareRequestAction.PENDING,
      ' ',
      walletId,
      shareRequest.requestedFromWallet,
      fileShareDetails,
    )

    const shareRequestModel = new this.shareRequestModel(createFileShareRequestDto)
    const shareRequestResult = await shareRequestModel.save()

    if (shareRequestResult == null) {
      throw new InternalServerErrorException(FilesErrors.INTERNAL_ERROR)
    }

    return shareRequestResult
  }

  /**
   * Deletes File share request
   * Only the request owner (who made the request), can deleted it
   */
  async deleteShareRequest(userId: string, requestId: string): Promise<StandardMessageResponse | any> {
    const requestDetails = await this.shareRequestModel.findById(requestId)

    if (requestDetails == null) {
      throw new NotFoundException(FilesErrors.REQUEST_NOT_FOUND)
    }

    if (requestDetails['raisedByUser'] != userId) {
      throw new UnauthorizedException(FilesErrors.REQUEST_DELETE_PERMISSION_ERROR)
    }

    const result = await this.shareRequestModel.findOneAndDelete({ _id: requestId })

    return result
  }

  /**
   * ACCEPTS, REJECTS the file ShareRequest
   * if ACCEPTED:
   * Signs the AWS File Url and creates an ACL Record for it
   * Stores the ACL RestrictedUrl in ShareRequest's fileUrl
   */
  async respondToShareRequest(
    walletId: string,
    requestId: string,
    vcId: string,
    action: ShareRequestAction,
  ): Promise<StandardMessageResponse | any> {
    if (
      action != ShareRequestAction.ACCEPTED &&
      action != ShareRequestAction.REJECTED &&
      action != ShareRequestAction.PENDING
    ) {
      throw new BadRequestException(FilesErrors.INVALID_ACTION)
    }

    const requestDetails = await this.shareRequestModel.findOne({ _id: requestId })
    const vcDetails = await this.vcReadService.getVCById(vcId)
    const fileDetails = await this.filesReadService.getFileById(vcDetails['fileId'])

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
        fileDetails['storedUrl'],
        generateVCAccessControlExpirationTimestamp(requestDetails['fileShareDetails']['restrictions']['expiresIn']),
        requestDetails['fileShareDetails']['restrictions']['viewCount'],
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
            fileShareUrl: restrictedFile['restrictedUrl'],
          },
          { new: true },
        )
        .exec()
    }

    if (actionResult == null) {
      throw new InternalServerErrorException(FilesErrors.INTERNAL_ERROR)
    }

    return actionResult
  }
}
