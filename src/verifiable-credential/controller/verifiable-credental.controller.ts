import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  DELETE_CREDENTIAL_API,
  DELETE_SHARE_REQUEST_API,
  GET_CREDENTIAL_LIST_API,
  GET_SHARE_REQUESTS_API,
  GET_SINGLE_CREDENTIAL_API,
  REQUEST_SHARE_API,
  RESPONSE_SHARE_REQUEST_API,
  SHARE_CREDENTIAL_API,
  STORE_CREDENTIAL_API,
  VIEW_CREDENTIAL_API,
} from 'src/common/constants/api-documentation'
import { VcApiRoutes } from 'src/common/constants/api-routes'
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
    return await this.vcCreateService.createVerifiableCredential(body)
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
    return await this.vcCreateService.pushVerifiableCredential(body)
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
    return await this.vcReadService.renderVCDocument(keyParam, res)
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
    return await this.vcReadService.getVCByIdAndWalletId(queryParams)
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
    return await this.vcReadService.getAllWalletVc(queryParams, skip)
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
    return await this.vcDeleteService.deleteVc(queryParams)
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
    return await this.shareRequestCreateService.shareVc(queryParams.vcId, queryParams.walletId, body)
  }

  /**
   * Fetches the list of share requests that the user has made or received from someone.
   * @param queries The query parameters containing the userId.
   * @returns The list of share requests.
   */
  @Get(VcApiRoutes.GET_SHARE_REQUESTS)
  @ApiOperation({
    summary: GET_SHARE_REQUESTS_API.summary,
    description: GET_SHARE_REQUESTS_API.description,
  })
  @ApiResponse({
    status: GET_SHARE_REQUESTS_API.successResponseCode,
    description: GET_SHARE_REQUESTS_API.successResponseMessage,
    type: ShareRequestsEntityList,
  })
  async getShareRequests(@Query() queries: GetShareFileRequestsDto) {
    return await this.shareRequestReadService.getShareRequestsList(queries.walletId, queries)
  }

  /**
   * Requests to share a file from another user.
   * @param userId The user ID of the requesting user.
   * @param body The request body containing information about the file to be shared.
   * @returns The share request entity if the request is sent successfully.
   */
  @Post(VcApiRoutes.GET_SHARE_REQUESTS)
  @ApiOperation({
    summary: REQUEST_SHARE_API.summary,
    description: REQUEST_SHARE_API.description,
  })
  @ApiResponse({
    status: REQUEST_SHARE_API.successResponseCode,
    description: REQUEST_SHARE_API.successResponseMessage,
    type: ShareRequestEntity,
  })
  async requestShareFile(@Query('walletId') walletId: string, @Body() body: RequestShareFileRequestDto) {
    return await this.shareRequestCreateService.requestShareFile(walletId, body)
  }

  /**
   * Deletes a share request by its ID.
   * @param queryParams The query parameters containing user ID and request ID.
   * @returns The deleted share request entity if successful.
   */
  @Delete(VcApiRoutes.GET_SHARE_REQUESTS)
  @ApiOperation({
    summary: DELETE_SHARE_REQUEST_API.summary,
    description: DELETE_SHARE_REQUEST_API.description,
  })
  @ApiResponse({
    status: DELETE_SHARE_REQUEST_API.successResponseCode,
    description: DELETE_SHARE_REQUEST_API.successResponseMessage,
    type: ShareRequestEntity,
  })
  async deleteShareRequest(@Query() queryParams: GetShareRequestDto) {
    return await this.shareRequestUpdateService.deleteShareRequest(queryParams.walletId, queryParams.requestId)
  }

  /**
   * Responds to a share request.
   * @param queryParams The query parameters containing user ID, request ID, file ID, and action.
   * @returns The updated share request entity if successful.
   */
  @Patch(VcApiRoutes.GET_SHARE_REQUESTS)
  @ApiOperation({
    summary: RESPONSE_SHARE_REQUEST_API.summary,
    description: RESPONSE_SHARE_REQUEST_API.description,
  })
  @ApiResponse({
    status: RESPONSE_SHARE_REQUEST_API.successResponseCode,
    description: RESPONSE_SHARE_REQUEST_API.successResponseMessage,
    type: ShareRequestEntity,
  })
  async respondToShareRequest(@Query() queryParams: ShareVcRequestDto) {
    return await this.shareRequestUpdateService.respondToShareRequest(
      queryParams.walletId,
      queryParams.requestId,
      queryParams.vcId,
      queryParams.action,
    )
  }
}
