import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CREATE_WALLET_API, DELETE_WALLET_API, GET_WALLET_DETAILS_API } from 'src/common/constants/api-documentation'
import { StandardWalletRequestDto } from 'src/files/dto/standard-wallet-request.dto'
import { CreateWalletRequestDto } from '../dto/create-wallet-request.dto'
import { WalletCreateService } from '../service/wallet-create.service'
import { WalletDeleteService } from '../service/wallet-delete.service'
import { WalletReadService } from '../service/wallet-read.service'
import { WalletEntity } from '../wallet.entity'

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletCreateService: WalletCreateService,
    private readonly walletReadService: WalletReadService,
    private readonly walletDeleteService: WalletDeleteService,
  ) {}

  /**
   * Creates a wallet with the given userId.
   * @param requestBody The request body containing the userId for which the wallet is to be created.
   * @returns The wallet entity representing the newly created wallet.
   */
  @Post()
  @ApiOperation({ summary: CREATE_WALLET_API.summary, description: CREATE_WALLET_API.description })
  @ApiResponse({
    status: CREATE_WALLET_API.successResponseCode,
    description: CREATE_WALLET_API.successResponseMessage,
    type: WalletEntity,
  })
  async createWallet(@Body() requestBody: CreateWalletRequestDto) {
    const wallet = await this.walletCreateService.createWallet(requestBody)
    return wallet
  }

  /**
   * Deletes the wallet associated with the given userId.
   * @param queryParams The query parameters containing the userId of the wallet to be deleted.
   * @returns A response indicating the success of the deletion operation.
   */
  @Delete()
  @ApiOperation({
    summary: DELETE_WALLET_API.summary,
    description: DELETE_WALLET_API.description,
  })
  @ApiResponse({ status: DELETE_WALLET_API.successResponseCode, description: DELETE_WALLET_API.successResponseMessage })
  async deleteWallet(@Query() queryParams: StandardWalletRequestDto) {
    const wallet = await this.walletDeleteService.deleteWallet(queryParams)
    return wallet
  }

  /**
   * Retrieves the details of the wallet for the given userId.
   * @param queryParams The query parameters containing the userId of the wallet to retrieve details for.
   * @returns The details of the wallet associated with the provided userId.
   */
  @Get()
  @ApiOperation({
    summary: GET_WALLET_DETAILS_API.summary,
    description: GET_WALLET_DETAILS_API.description,
  })
  @ApiResponse({
    status: GET_WALLET_DETAILS_API.successResponseCode,
    description: GET_WALLET_DETAILS_API.successResponseMessage,
    type: WalletEntity,
  })
  async getWalletdetails(@Query() queryParams: StandardWalletRequestDto) {
    const wallet = await this.walletReadService.getWalletDetails(queryParams)
    return wallet
  }
}
