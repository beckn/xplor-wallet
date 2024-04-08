import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { WalletErrors } from 'src/common/constants/error-messages'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { StandardWalletRequestDto } from 'src/files/dto/standard-wallet-request.dto'
import { Wallet } from '../schemas/wallet.schema'
import { WalletReadService } from './wallet-read.service'

@Injectable()
export class WalletDeleteService {
  constructor(
    @InjectModel('Wallet') private readonly walletModel: Model<Wallet>,
    private readonly walletReadService: WalletReadService,
  ) {}

  /**
   * Deletes a wallet with userId or walletId
   */
  async deleteWallet(queryParams: StandardWalletRequestDto): Promise<StandardMessageResponse | any> {
    // Check if the wallet exists for the specified user
    let existingWallet
    if (queryParams.walletId != null) {
      existingWallet = await this.walletReadService.findWalletByWalletId(queryParams.walletId)
    } else {
      existingWallet = await this.walletReadService.findWalletByUserId(queryParams.userId)
    }

    if (!existingWallet) {
      // Throw an exception if the wallet doesn't exist
      throw new NotFoundException(WalletErrors.WALLET_NOT_FOUND)
    }

    // If the wallet exists, delete it
    if (queryParams.walletId != null) {
      const result = await this.walletModel.findOneAndDelete({ _id: queryParams.walletId })
      return result
    } else {
      const result = await this.walletModel.findOneAndDelete({ userId: queryParams.userId })
      return {
        data: result,
      }
    }
  }
}
