import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { GET_CREDENTIAL_LIST_API, STORE_CREDENTIAL_API } from 'src/common/constants/api-documentation'
import { FilesService } from 'src/files/service/files.service'
import { WalletReadService } from 'src/wallet/service/wallet-read.service'
import { CreateVCRequestBodyDto } from '../dto/create-vc-request-body.dto'
import { GetVCListRequestDto } from '../dto/get-vc-list-request.dto'
import { GetVCRequestDto } from '../dto/get-vc-request.dto'
import { CreateVCRequestBodyEntity } from '../entities/create-vc-request-body.entity'
import { VCEntityList } from '../entities/vc.entity'
import { VerifiableCredentialCreateService } from '../service/verifiable-credential-create.service'
import { VerifiableCredentialReadService } from '../service/verifiable-credential-read.service'

@ApiTags('Verifiable Credential (VC)')
@Controller('wallet/vc')
export class VerifiableCredentialController {
  constructor(
    private readonly vcCreateService: VerifiableCredentialCreateService,
    private readonly vcReadService: VerifiableCredentialReadService,
    private readonly fileService: FilesService,
    private readonly walletService: WalletReadService,
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
  async getVCById(@Query() queryParams: GetVCRequestDto) {
    const vcResult = await this.vcReadService.getVCById(queryParams)
    return vcResult
  }
}
