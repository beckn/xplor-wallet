import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import 'multer'
import { ShareRequestAction, VcType } from 'src/common/constants/enums'
import { VcErrors, ViewAccessControlErrors } from 'src/common/constants/error-messages'
import { RegistryRequestRoutes } from 'src/common/constants/request-routes'
import { FilesReadService } from 'src/files/service/files-read.service'
import { renderFileToResponse } from 'src/utils/file.utils'
import {
  generateCurrentIsoTime,
  generateVCAccessControlExpirationTimestamp,
  renderVCDocumentToResponse,
} from 'src/utils/vc.utils'
import { VCAccessControlReadService } from 'src/vc-access-control/service/verifiable-credential-access-control-read.service'
import { VCAccessControlUpdateService } from 'src/vc-access-control/service/verifiable-credential-access-control-update.service'
import { MaxVCShareHours, REGISTRY_SERVICE_URL } from '../../common/constants/name-constants'
import { GetVCListRequestDto } from '../dto/get-vc-list-request.dto'
import { GetVCRequestDto } from '../dto/get-vc-request.dto'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'
import { ShareRequestReadService } from './share-request-read.service'
@Injectable()
export class VerifiableCredentialReadService {
  constructor(
    @InjectModel('VerifiableCredential') private readonly vcModel: Model<VerifiableCredential>,
    private readonly configService: ConfigService,
    private readonly vcAclReadService: VCAccessControlReadService,
    private readonly vcAclUpdateService: VCAccessControlUpdateService,
    private readonly filesReadService: FilesReadService,
    private readonly shareRequestReadService: ShareRequestReadService,
  ) {}

  /*
  This function returns list of VCs in the document and also applys search queries.
   **/
  async getAllWalletVc(queryParams: GetVCListRequestDto, skip: number): Promise<any> {
    const query: any = { walletId: queryParams.walletId }
    if (queryParams.category) {
      query.category = queryParams.category
    }

    if (queryParams.tags && queryParams.tags.length > 0) {
      query.tags = { $in: queryParams.tags }
    }

    // Add the search query condition to the query
    if (queryParams.searchQuery) {
      const regex = new RegExp(queryParams.searchQuery, 'i') // Case-insensitive regex pattern
      query.$or = [
        { name: { $regex: regex } },
        { category: { $regex: regex } },
        // Add more fields if needed
      ]
    }

    // Execute the query with pagination using the Mongoose model
    const filesResult = await this.vcModel.find(query).skip(skip).limit(queryParams.pageSize)

    if (filesResult.length < 1) {
      throw new NotFoundException(VcErrors.VCs_NOT_FOUND)
    }

    return filesResult
  }

  /*
  This function returns VC with the vcId and walletId
   **/
  async getVCByIdAndWalletId(queryParams: GetVCRequestDto): Promise<any> {
    const query: any = { walletId: queryParams.walletId, _id: queryParams.vcId }
    const vcDetails = await this.vcModel.findOne(query)

    if (!vcDetails) {
      throw new NotFoundException(VcErrors.VC_NOT_EXIST)
    }

    return vcDetails
  }

  async getVCById(vcId: string): Promise<any> {
    const query: any = { _id: vcId }
    const vcDetails = await this.vcModel.findOne(query)

    if (!vcDetails) {
      throw new NotFoundException(VcErrors.VC_NOT_EXIST)
    }

    return vcDetails
  }

  async renderVCDocument(restrictionKey: string, res): Promise<any> {
    // Fetch Access control details by restrictedKey
    // Finding Redis Cache to check if ACL Exists
    const aclDetails = await this.vcAclReadService.findCachedByRestrictedKey(restrictionKey)

    if (!aclDetails) {
      throw new NotFoundException(ViewAccessControlErrors.ACL_NOT_FOUND)
    }

    const vcDetails = await this.getVCById(aclDetails['vcId'])
    let fileDetails
    if (vcDetails['fileId']) {
      fileDetails = await this.filesReadService.getFileById(vcDetails['fileId'])
    }

    // Checking whether the allowedViewCount reached limit for the shareRequest

    if (aclDetails['viewAllowed'] === false && aclDetails['viewOnce'] === true && aclDetails['shareRequestId']) {
      throw new UnauthorizedException(VcErrors.VC_VIEW_ONCE_ERROR)
    } else if (aclDetails['viewAllowed'] === true && aclDetails['viewOnce'] === true && aclDetails['shareRequestId']) {
      // Update viewAllowed of Access Control
      await this.vcAclUpdateService.updateViewAllowedByRestrictionKey(aclDetails['restrictedKey'], false)
    } else if (aclDetails['viewAllowed'] === false) {
      throw new UnauthorizedException(VcErrors.VC_VIEW_ONCE_ERROR)
    }

    if (!aclDetails['shareRequestId'] && aclDetails['shareRequestId'] != '') {
      const requestDetails = await this.shareRequestReadService.getShareRequestsById(aclDetails['shareRequestId'])
      if (requestDetails.status != ShareRequestAction.ACCEPTED) {
        throw new UnauthorizedException(VcErrors.SHARE_REJECTED_ERROR)
      }
    }

    const currentIsoTime = generateCurrentIsoTime()
    const expirationTimestamp = aclDetails['expireTimeStamp']

    if (currentIsoTime < expirationTimestamp) {
      // The expiration timestamp has not yet been reached

      // TODO: Do vcType checks to render fileAccordingly
      if (vcDetails['type'] === VcType.SELF_ISSUED) {
        await renderFileToResponse(res, fileDetails['storedUrl'], restrictionKey)
      } else {
        // Hit the Registry layer to Render VC
        await renderVCDocumentToResponse(
          res,
          this.configService.get(REGISTRY_SERVICE_URL) + '/credentials/' + vcDetails['did'],
          vcDetails['templateId'],
          restrictionKey,
        )
      }
    } else {
      // The expiration timestamp has passed
      // Checking if the Access is for a share request
      if (aclDetails['shareRequestId'] != null) {
        if (aclDetails['shareRequestId']) {
          throw new UnauthorizedException(VcErrors.VC_EXPIRED_ERROR)
        }

        // Regenerate new accessControl Restriction Details
        const updatedAcl = await this.vcAclUpdateService.renewAccessControl(
          restrictionKey,
          generateVCAccessControlExpirationTimestamp(MaxVCShareHours),
        )

        // Update the fileUrl inside VC to new ACL restrictedUrl
        await this.vcModel
          .findOneAndUpdate(
            { _id: vcDetails['_id'].toString() },
            { restrictedUrl: updatedAcl['restrictedUrl'] },
            { new: true },
          )
          .exec()

        if (vcDetails['type'] === VcType.SELF_ISSUED) {
          await renderFileToResponse(res, fileDetails['storedUrl'], restrictionKey)
        } else {
          // Hit the Registry layer to Render VC
          await renderVCDocumentToResponse(
            res,
            this.configService.get(REGISTRY_SERVICE_URL) + RegistryRequestRoutes.READ_VC + vcDetails['did'],
            vcDetails['templateId'],
            restrictionKey,
          )
        }
      }
    }
  }
}
