import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { HttpResponseMessage } from 'src/common/constants/http-response-message'
import { getSuccessResponse } from 'src/utils/get-success-response'
import { WalletErrors } from '../../common/constants/error-messages'
import { StandardMessageResponse } from '../../common/constants/standard-message-response.dto'
import { StandardWalletRequestDto } from '../../files/dto/standard-wallet-request.dto'
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
      return getSuccessResponse(await result, HttpResponseMessage.OK)
    } else {
      const result = await this.walletModel.findOneAndDelete({ userId: queryParams.userId })
      return getSuccessResponse(await result, HttpResponseMessage.OK)
    }
  }
}
