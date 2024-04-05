import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { WalletErrors } from 'src/common/constants/error-messages'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { StandardWalletRequestDto } from 'src/files/dto/standard-wallet-request.dto'
import { Wallet } from '../schemas/wallet.schema'

@Injectable()
export class WalletReadService {
  constructor(@InjectModel('Wallet') private readonly walletModel: Model<Wallet>) {}

  /**
   * Returns Wallet details by userId
   */
  async findWalletByUserId(userId: string): Promise<Wallet> {
    return this.walletModel.findOne({ userId }).exec()
  }

  /**
   * Returns Wallet details by walletId
   */
  async findWalletByWalletId(walletId: string): Promise<Wallet> {
    return this.walletModel.findOne({ _id: walletId }).exec()
  }

  /**
   * Returns Wallet details by either with userId or walletId
   */
  async getWalletDetails(queryParams: StandardWalletRequestDto): Promise<StandardMessageResponse | any> {
    let walletDetails
    if (queryParams.walletId != null) {
      walletDetails = await this.findWalletByWalletId(queryParams.walletId)
    } else {
      walletDetails = await this.findWalletByUserId(queryParams.userId)
    }

    // Check if the wallet does not exist with the userId
    if (walletDetails == null) {
      throw new NotFoundException(WalletErrors.WALLET_NOT_FOUND)
    }

    return walletDetails
  }
}
