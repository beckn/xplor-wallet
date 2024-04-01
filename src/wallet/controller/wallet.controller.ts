import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { StandardWalletRequestDto } from 'src/files/dto/standard-wallet-request.dto'
import { CreateWalletRequestDto } from '../dto/create-wallet-request.dto'
import { WalletService } from '../service/wallet.service'
import { WalletEntity } from '../wallet.entity'

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Creates a wallet with the given userId.
   * @param requestBody The request body containing the userId for which the wallet is to be created.
   * @returns The wallet entity representing the newly created wallet.
   */
  @Post()
  @ApiOperation({ summary: 'Create wallet', description: 'Creates a wallet with given userId.' })
  @ApiResponse({ status: 201, description: 'Wallet created with the User Id.', type: WalletEntity })
  async createWallet(@Body() requestBody: CreateWalletRequestDto) {
    const wallet = await this.walletService.createWallet(requestBody.userId)
    return wallet
  }

  /**
   * Deletes the wallet associated with the given userId.
   * @param queryParams The query parameters containing the userId of the wallet to be deleted.
   * @returns A response indicating the success of the deletion operation.
   */
  @Delete()
  @ApiOperation({
    summary: 'Delete wallet',
    description: 'Deletes the wallet associated with the given userId or walletId',
  })
  @ApiResponse({ status: 200, description: 'Wallet deleted successfully.' })
  async deleteWallet(@Query() queryParams: StandardWalletRequestDto) {
    const wallet = await this.walletService.deleteWallet(queryParams)
    return wallet
  }

  /**
   * Retrieves the details of the wallet for the given userId.
   * @param queryParams The query parameters containing the userId of the wallet to retrieve details for.
   * @returns The details of the wallet associated with the provided userId.
   */
  @Get()
  @ApiOperation({
    summary: 'Get wallet details',
    description: 'Retrieves the details of the wallet for the given userId or walletId',
  })
  @ApiResponse({ status: 200, description: 'Retrieved wallet details successfully.', type: WalletEntity })
  async getWalletdetails(@Query() queryParams: StandardWalletRequestDto) {
    const wallet = await this.walletService.getWalletDetails(queryParams)
    return wallet
  }
}
