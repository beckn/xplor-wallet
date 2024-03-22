import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
<<<<<<< HEAD
import { StandardWalletRequestDto } from 'src/files/dto/standard-wallet-request.dto'
=======
>>>>>>> develop
import { CreateWalletRequestDto } from '../dto/create-wallet-request.dto'
import { WalletService } from '../service/wallet.service'
import { WalletEntity } from '../wallet.entity'

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @ApiOperation({ summary: 'Create wallet', description: 'Creates a wallet with given userId' })
  @ApiResponse({ status: 201, description: 'Wallet created with the User Id.', type: WalletEntity })
  async createWallet(@Body() requestBody: CreateWalletRequestDto) {
    const wallet = await this.walletService.createWallet(requestBody.userId)
    return wallet
  }

  @Delete()
  @ApiOperation({ summary: 'Delete wallet', description: 'Deletes the wallet associated with the given userId' })
  @ApiResponse({ status: 200, description: 'Wallet deleted successfully.' })
<<<<<<< HEAD
  async deleteWallet(@Query() queryParams: StandardWalletRequestDto) {
    const wallet = await this.walletService.deleteWallet(queryParams)
=======
  async deleteWallet(@Query('userId') userId: string) {
    const wallet = await this.walletService.deleteWallet(userId)
>>>>>>> develop
    return wallet
  }

  @Get()
  @ApiOperation({
    summary: 'Get wallet details',
    description: 'Retrieves the details of the wallet for the given userId',
  })
  @ApiResponse({ status: 200, description: 'Retrieved wallet details successfully.', type: WalletEntity })
<<<<<<< HEAD
  async getWalletdetails(@Query() queryParams: StandardWalletRequestDto) {
    const wallet = await this.walletService.getWalletDetails(queryParams)
=======
  async getWalletdetails(@Query('userId') userId: string) {
    const wallet = await this.walletService.getWalletDetails(userId)
>>>>>>> develop
    return wallet
  }
}
