import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import 'multer'
import { ShareRequestAction, VcType } from '../../common/constants/enums'
import { VcErrors, ViewAccessControlErrors, WalletErrors } from '../../common/constants/error-messages'
import { HttpResponseMessage } from '../../common/constants/http-response-message'
import { MaxVCShareHours, REGISTRY_SERVICE_URL } from '../../common/constants/name-constants'
import { RegistryRequestRoutes } from '../../common/constants/request-routes'
import { StandardWalletRequestDto } from '../../files/dto/standard-wallet-request.dto'
import { FilesReadService } from '../../files/service/files-read.service'
import { FilesUpdateService } from '../../files/service/files-update.service'
import { renderFileToResponse } from '../../utils/file.utils'
import { getSuccessResponse } from '../../utils/get-success-response'
import {
  generateCurrentIsoTime,
  generateVCAccessControlExpirationTimestamp,
  renderVCDocumentToResponse,
  renderViewVCHtmlPage,
} from '../../utils/vc.utils'
import { VCAccessControlReadService } from '../../vc-access-control/service/verifiable-credential-access-control-read.service'
import { VCAccessControlUpdateService } from '../../vc-access-control/service/verifiable-credential-access-control-update.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { GetVCListRequestDto } from '../dto/get-vc-list-request.dto'
import { GetVCRequestDto } from '../dto/get-vc-request.dto'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'
import { ShareRequestReadService } from './share-request-read.service'
import { VC_RECEIVED_VIEW_HTML, VC_SELF_ISSUED_VIEW_HTML } from 'src/config/vc.config'
@Injectable()
export class VerifiableCredentialReadService {
  constructor(
    @InjectModel('VerifiableCredential') private readonly vcModel: Model<VerifiableCredential>,
    private readonly configService: ConfigService,
    private readonly vcAclReadService: VCAccessControlReadService,
    private readonly vcAclUpdateService: VCAccessControlUpdateService,
    private readonly filesReadService: FilesReadService,
    private readonly walletReadService: WalletReadService,
    private readonly filesUpdateService: FilesUpdateService,
    private readonly shareRequestReadService: ShareRequestReadService,
  ) {}

  /*
  This function returns list of VCs in the document and also applys search queries.
   **/
  async getAllWalletVc(queryParams: GetVCListRequestDto, skip: number): Promise<any> {
    const wallet = await this.walletReadService.getWalletDetails(
      new StandardWalletRequestDto(null, queryParams.walletId),
    )

    if (!wallet['data']) {
      throw new NotFoundException(WalletErrors.WALLET_NOT_FOUND)
    }

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
      query.$or = [{ name: { $regex: regex } }, { category: { $regex: regex } }]
    }

    // Execute the query with pagination using the Mongoose model
    const filesResult = await this.vcModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(queryParams.pageSize)

    // Fetch file details for each fileId and add fileType to filesResult
    const filesWithDetails = await Promise.all(
      filesResult.map(async (fileItem) => {
        if (!fileItem.fileId) {
          return { ...fileItem.toJSON() }
        }

        const fileDetails = await this.filesReadService.getFileById(fileItem.fileId)
        return { fileType: fileDetails.fileType, ...fileItem.toJSON() }
      }),
    )

    return getSuccessResponse(await filesWithDetails, HttpResponseMessage.OK)
  }

  /*
  This function returns VC with the vcId and walletId
   **/
  async getVCByIdAndWalletId(queryParams: GetVCRequestDto): Promise<any> {
    const query: any = { walletId: queryParams.walletId, _id: queryParams.vcId }
    const vcDetails = await this.vcModel.findOne(query)

    const wallet = await this.walletReadService.getWalletDetails(
      new StandardWalletRequestDto(null, queryParams.walletId),
    )

    if (!wallet['data']) {
      throw new NotFoundException(WalletErrors.WALLET_NOT_FOUND)
    }

    if (!vcDetails) {
      throw new NotFoundException(VcErrors.VC_NOT_EXIST)
    }

    const fileDetails = await this.filesReadService.getFileById(vcDetails.fileId)
    return getSuccessResponse(await { fileType: fileDetails.fileType, ...vcDetails.toJSON() }, HttpResponseMessage.OK)
  }

  async getVCById(vcId: string): Promise<any> {
    const query: any = { _id: vcId }
    const vcDetails = await this.vcModel.findOne(query)

    if (!vcDetails) {
      throw new NotFoundException(VcErrors.VC_NOT_EXIST)
    }

    const fileDetails = await this.filesReadService.getFileById(vcDetails.fileId)
    return getSuccessResponse(await { fileType: fileDetails.fileType, ...vcDetails.toJSON() }, HttpResponseMessage.OK)
  }

  /*
  This function returns the VC in pdf, image or the uploaded file format
   **/
  async renderVCDocument(restrictionKey: string, res): Promise<any> {
    // Fetch Access control details by restrictedKey
    // Finding Redis Cache to check if ACL Exists
    const aclDetails = await this.vcAclReadService.findCachedByRestrictedKey(restrictionKey)
    if (!aclDetails) {
      throw new NotFoundException(ViewAccessControlErrors.ACL_NOT_FOUND)
    }

    const vcDetails = await this.getVCById(aclDetails['vcId'])
    let fileDetails
    if (vcDetails.data['fileId']) {
      fileDetails = await this.filesReadService.getFileById(vcDetails.data['fileId'])
    }

    // Checking whether the allowedViewCount reached limit for the shareRequest

    if (aclDetails['viewAllowed'] === false && aclDetails['viewOnce'] === true) {
      throw new UnauthorizedException(VcErrors.VC_VIEW_ONCE_ERROR)
    } else if (aclDetails['viewAllowed'] === true && aclDetails['viewOnce'] === true) {
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

      if (vcDetails.data['type'] === VcType.SELF_ISSUED) {
        // Render html with the file!
        await renderViewVCHtmlPage(
          VC_SELF_ISSUED_VIEW_HTML.replaceAll('remote-url', fileDetails['storedUrl']).replace(
            'vc-name',
            vcDetails.data['name'],
          ),
          res,
        )
        return
        const renderedFile = await renderFileToResponse(res, fileDetails['storedUrl'], restrictionKey)
        if (!renderedFile) {
          const newFileUrl = await this.filesUpdateService.refreshFileUrl(vcDetails.data['fileId'])

          await renderFileToResponse(res, newFileUrl, restrictionKey)
        }
      } else {
        // Hit the Registry layer to Render VC
        await renderViewVCHtmlPage(
          VC_RECEIVED_VIEW_HTML.replaceAll(
            'remote-url',
            this.configService.get(REGISTRY_SERVICE_URL) + RegistryRequestRoutes.READ_VC + vcDetails.data['did'],
          )
            .replace('vc-name', vcDetails.data['name'])
            .replace('template-id-here', vcDetails.data['templateId']),
          res,
        )
        await renderVCDocumentToResponse(
          res,
          this.configService.get(REGISTRY_SERVICE_URL) + RegistryRequestRoutes.READ_VC + vcDetails.data['did'],
          vcDetails.data['templateId'],
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
            { _id: vcDetails.data['_id'].toString() },
            { restrictedUrl: updatedAcl['restrictedUrl'] },
            { new: true },
          )
          .exec()

        if (vcDetails.data['type'] === VcType.SELF_ISSUED) {
          // Render html with the file!
          await renderViewVCHtmlPage(
            VC_SELF_ISSUED_VIEW_HTML.replaceAll('remote-url', fileDetails['storedUrl']).replace(
              'vc-name',
              vcDetails.data['name'],
            ),
            res,
          )
          return
          const renderedFile = await renderFileToResponse(res, fileDetails['storedUrl'], restrictionKey)
          if (!renderedFile) {
            const newFileUrl = await this.filesUpdateService.refreshFileUrl(vcDetails.data['fileId'])
            await renderFileToResponse(res, newFileUrl, restrictionKey)
          }
        } else {
          // Hit the Registry layer to Render VC
          await renderViewVCHtmlPage(
            VC_RECEIVED_VIEW_HTML.replaceAll(
              'remote-url',
              this.configService.get(REGISTRY_SERVICE_URL) + RegistryRequestRoutes.READ_VC + vcDetails.data['did'],
            )
              .replace('vc-name', vcDetails.data['name'])
              .replace('template-id-here', vcDetails.data['templateId']),
            res,
          )
          return
          await renderVCDocumentToResponse(
            res,
            this.configService.get(REGISTRY_SERVICE_URL) + RegistryRequestRoutes.READ_VC + vcDetails.data['did'],
            vcDetails.data['templateId'],
            restrictionKey,
          )
        }
      }
    }
  }
}
