import { Body, Controller, Delete, Get, Param, Post, Query, Res } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  DELETE_CREDENTIAL_API,
  GET_CREDENTIAL_LIST_API,
  GET_SINGLE_CREDENTIAL_API,
  STORE_CREDENTIAL_API,
  VIEW_CREDENTIAL_API,
} from 'src/common/constants/api-documentation'
import { CreateVCRequestBodyDto } from '../dto/create-vc-request-body.dto'
import { GetVCListRequestDto } from '../dto/get-vc-list-request.dto'
import { GetVCRequestDto } from '../dto/get-vc-request.dto'
import { CreateVCRequestBodyEntity } from '../entities/create-vc-request-body.entity'
import { VCEntityList } from '../entities/vc.entity'
import { VerifiableCredentialCreateService } from '../service/verifiable-credential-create.service'
import { VerifiableCredentialDeleteService } from '../service/verifiable-credential-delete.service'
import { VerifiableCredentialReadService } from '../service/verifiable-credential-read.service'

@ApiTags('Verifiable Credential (VC)')
@Controller('wallet/vc')
export class VerifiableCredentialController {
  constructor(
    private readonly vcCreateService: VerifiableCredentialCreateService,
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
    const storeCredentialResult = await this.vcCreateService.createVerifiableCredential(body, null)
    return storeCredentialResult
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
    const vcResult = await this.vcReadService.getVCById(queryParams)
    return vcResult
  }

  @Get('/view')
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
}
