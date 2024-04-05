import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  DELETE_CREDENTIAL_API,
  GET_CREDENTIAL_LIST_API,
  GET_SINGLE_CREDENTIAL_API,
  SHARE_CREDENTIAL_API,
  STORE_CREDENTIAL_API,
  VIEW_CREDENTIAL_API,
} from 'src/common/constants/api-documentation'
import { CreateVCRequestBodyDto } from '../dto/create-vc-request-body.dto'
import { GetShareFileRequestsDto } from '../dto/get-share-file-request-list.dto'
import { GetVCListRequestDto } from '../dto/get-vc-list-request.dto'
import { GetShareRequestDto, GetVCRequestDto, ShareVcRequestDto } from '../dto/get-vc-request.dto'
import { PushVCRequestBodyDto } from '../dto/push-vc-request-body.dto'
import { RequestShareFileRequestDto } from '../dto/request-share-file-request.dto'
import { ShareFileRequestDto } from '../dto/share-file-request.dto'
import { CreateVCRequestBodyEntity } from '../entities/create-vc-request-body.entity'
import { ShareRequestEntity, ShareRequestsEntityList } from '../entities/share-request.entity'
import { VCEntityList } from '../entities/vc.entity'
import { ShareRequestCreateService } from '../service/share-request-create.service'
import { ShareRequestReadService } from '../service/share-request-read.service'
import { ShareRequestUpdateService } from '../service/share-request-update.service'
import { VerifiableCredentialCreateService } from '../service/verifiable-credential-create.service'
import { VerifiableCredentialDeleteService } from '../service/verifiable-credential-delete.service'
import { VerifiableCredentialReadService } from '../service/verifiable-credential-read.service'

@ApiTags('Verifiable Credential (VC)')
@Controller('wallet/vc')
export class VerifiableCredentialController {
  constructor(
    private readonly vcCreateService: VerifiableCredentialCreateService,
    private readonly shareRequestReadService: ShareRequestReadService,
    private readonly shareRequestUpdateService: ShareRequestUpdateService,
    private readonly shareRequestCreateService: ShareRequestCreateService,
    private readonly vcReadService: VerifiableCredentialReadService,
    private readonly vcDeleteService: VerifiableCredentialDeleteService,
  ) {}

  /**
   * Creates a new VC for the file with the provided data.
   * @param body The request body containing VC data.
   * @returns The stored VC entity.
   */
  @Post()
  @ApiOperation({
    summary: STORE_CREDENTIAL_API.summary,
    description: STORE_CREDENTIAL_API.description,
  })
  @ApiResponse({
    status: STORE_CREDENTIAL_API.successResponseCode,
    description: STORE_CREDENTIAL_API.successResponseMessage,
    type: CreateVCRequestBodyEntity,
  })
  async storeCredential(@Body() body: CreateVCRequestBodyDto) {
    const storeCredentialResult = await this.vcCreateService.createVerifiableCredential(body)
    return storeCredentialResult
  }

  /**
   * Creates a new VC for the file with the provided data.
   * @param body The request body containing VC data.
   * @returns The stored VC entity.
   */
  @Post('/push')
  @ApiOperation({
    summary: STORE_CREDENTIAL_API.summary,
    description: STORE_CREDENTIAL_API.description,
  })
  @ApiResponse({
    status: STORE_CREDENTIAL_API.successResponseCode,
    description: STORE_CREDENTIAL_API.successResponseMessage,
    type: CreateVCRequestBodyEntity,
  })
  async pushCredentialToWallet(@Body() body: PushVCRequestBodyDto) {
    const storeCredentialResult = await this.vcCreateService.pushVerifiableCredential(body)
    return storeCredentialResult
  }

  @Get('/view/:restrictedKey')
  @ApiOperation({
    summary: VIEW_CREDENTIAL_API.summary,
    description: VIEW_CREDENTIAL_API.description,
  })
  @ApiResponse({
    status: VIEW_CREDENTIAL_API.successResponseCode,
    description: VIEW_CREDENTIAL_API.successResponseMessage,
    type: VCEntityList,
  })
  async viewVCDocument(@Param('restrictedKey') keyParam: string, @Res() res) {
    const vcResult = await this.vcReadService.renderVCDocument(keyParam, res)
    return vcResult
  }

  @Get('/single')
  @ApiOperation({
    summary: GET_SINGLE_CREDENTIAL_API.summary,
    description: GET_SINGLE_CREDENTIAL_API.description,
  })
  @ApiResponse({
    status: GET_SINGLE_CREDENTIAL_API.successResponseCode,
    description: GET_SINGLE_CREDENTIAL_API.successResponseMessage,
    type: VCEntityList,
  })
  async getVCById(@Query() queryParams: GetVCRequestDto) {
    const vcResult = await this.vcReadService.getVCByIdAndWalletId(queryParams)
    return vcResult
  }

  @Get()
  @ApiOperation({
    summary: GET_CREDENTIAL_LIST_API.summary,
    description: GET_CREDENTIAL_LIST_API.description,
  })
  @ApiResponse({
    status: GET_CREDENTIAL_LIST_API.successResponseCode,
    description: GET_CREDENTIAL_LIST_API.successResponseMessage,
    type: VCEntityList,
  })
  async getAllVC(@Query() queryParams: GetVCListRequestDto) {
    const skip = (queryParams.page - 1) * queryParams.pageSize
    const vcListResult = await this.vcReadService.getAllWalletVc(queryParams, skip)
    return vcListResult
  }

  @Delete()
  @ApiOperation({
    summary: DELETE_CREDENTIAL_API.summary,
    description: DELETE_CREDENTIAL_API.description,
  })
  @ApiResponse({
    status: DELETE_CREDENTIAL_API.successResponseCode,
    description: DELETE_CREDENTIAL_API.successResponseMessage,
    type: VCEntityList,
  })
  async deleteVC(@Query() queryParams: GetVCRequestDto) {
    const vcResult = await this.vcDeleteService.deleteVc(queryParams)
    return vcResult
  }

  /**
   * Shares a file with another user. This generates an self ACCEPTED file share request with the expiry time and allowed view Count entered by the user and generates a publically access file document link of the File Access Control.
   * @param queryParams The query parameters containing user ID and file ID.
   * @param body The request body containing information about the file to be shared.
   * @returns The share request entity if the file is shared successfully.
   */
  @Post('/share')
  @ApiOperation({
    summary: SHARE_CREDENTIAL_API.summary,
    description: SHARE_CREDENTIAL_API.description,
  })
  @ApiResponse({
    status: SHARE_CREDENTIAL_API.successResponseCode,
    description: SHARE_CREDENTIAL_API.successResponseMessage,
    type: ShareRequestEntity,
  })
  async shareFile(@Query() queryParams: GetVCRequestDto, @Body() body: ShareFileRequestDto) {
    const shareFile = await this.shareRequestCreateService.shareVc(queryParams.vcId, queryParams.walletId, body)
    return shareFile
  }

  /**
   * Fetches the list of share requests that the user has made or received from someone.
   * @param queries The query parameters containing the userId.
   * @returns The list of share requests.
   */
  @Get('/share/requests')
  @ApiOperation({
    summary: 'Get Share Requests',
    description: 'Fetches the list of share requests that the user has made or received from someone.',
  })
  @ApiResponse({ status: 200, description: 'Share requests retrieved successfully.', type: ShareRequestsEntityList })
  @ApiResponse({ status: 404, description: 'Share requests not found' })
  async getShareRequests(@Query() queries: GetShareFileRequestsDto) {
    const shareRequests = await this.shareRequestReadService.getShareRequestsList(queries.walletId, queries)
    return shareRequests
  }

  /**
   * Requests to share a file from another user.
   * @param userId The user ID of the requesting user.
   * @param body The request body containing information about the file to be shared.
   * @returns The share request entity if the request is sent successfully.
   */
  @Post('/share/requests')
  @ApiOperation({
    summary: 'Request Share File',
    description:
      'Requests to share a file from another user. Creates a new File Share Request and shows up in the receiver user wallet to accept or reject the file share request, by default the status is PENDING.',
  })
  @ApiResponse({ status: 200, description: 'Share request sent successfully.', type: ShareRequestEntity })
  async requestShareFile(@Query('walletId') walletId: string, @Body() body: RequestShareFileRequestDto) {
    const shareFile = await this.shareRequestCreateService.requestShareFile(walletId, body)
    return shareFile
  }

  /**
   * Deletes a share request by its ID.
   * @param queryParams The query parameters containing user ID and request ID.
   * @returns The deleted share request entity if successful.
   */
  @Delete('/share/requests')
  @ApiOperation({
    summary: 'Delete Share Request',
    description:
      'Deletes a share request by its id. Only the request owner who made the request can delete this request.',
  })
  @ApiResponse({ status: 200, description: 'Share request deleted successfully.', type: ShareRequestEntity })
  async deleteShareRequest(@Query() queryParams: GetShareRequestDto) {
    const shareFile = await this.shareRequestUpdateService.deleteShareRequest(
      queryParams.walletId,
      queryParams.requestId,
    )
    return shareFile
  }

  /**
   * Responds to a share request.
   * @param queryParams The query parameters containing user ID, request ID, file ID, and action.
   * @returns The updated share request entity if successful.
   */
  @Patch('/share/requests')
  @ApiOperation({
    summary: 'Respond To Share Request',
    description:
      'Responds to a share request. Accept or reject the request raised by the other users. Accepting the request will generate an Access Control link for the expiry Time and generate a file document link to access it.',
  })
  @ApiResponse({ status: 200, description: 'Response sent successfully.', type: ShareRequestEntity })
  async respondToShareRequest(@Query() queryParams: ShareVcRequestDto) {
    const shareFile = await this.shareRequestUpdateService.respondToShareRequest(
      queryParams.walletId,
      queryParams.requestId,
      queryParams.vcId,
      queryParams.action,
    )
    return shareFile
  }
}
