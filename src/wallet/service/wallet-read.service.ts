import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { WalletErrors } from '../../common/constants/error-messages'
import { HttpResponseMessage } from '../../common/constants/http-response-message'
import { StandardMessageResponse } from '../../common/constants/standard-message-response.dto'
import { StandardWalletRequestDto } from '../../files/dto/standard-wallet-request.dto'
import { getSuccessResponse } from '../../utils/get-success-response'
import { Wallet } from '../schemas/wallet.schema'

@Injectable()
export class WalletReadService {
  constructor(@InjectModel('Wallet') private readonly walletModel: Model<Wallet>) {}

  /**
   * Returns Wallet details by userId
   */
  async findWalletByUserId(userId: string): Promise<Wallet> {
    return getSuccessResponse(await await this.walletModel.findOne({ userId }).then(), HttpResponseMessage.OK)
  }

  /**
   * Returns Wallet details by walletId
   */
  async findWalletByWalletId(walletId: string): Promise<Wallet> {
    return getSuccessResponse(await this.walletModel.findOne({ _id: walletId }).then(), HttpResponseMessage.OK)
  }

  /**
   * Returns Wallet details by either with userId or walletId
   */
  async getWalletDetails(queryParams: StandardWalletRequestDto): Promise<StandardMessageResponse | any> {
    let walletDetails
    if (!queryParams.walletId && !queryParams.userId) {
      throw new BadRequestException(WalletErrors.MISSING_FIELDS)
    }

    if (queryParams.walletId != null) {
      walletDetails = await this.findWalletByWalletId(queryParams.walletId)
    } else {
      walletDetails = await this.findWalletByUserId(queryParams.userId)
    }

    // Check if the wallet does not exist with the userId
    if (!walletDetails.data) {
      throw new NotFoundException(WalletErrors.WALLET_NOT_FOUND)
    }

    return getSuccessResponse(walletDetails.data, HttpResponseMessage.OK)
  }
}
