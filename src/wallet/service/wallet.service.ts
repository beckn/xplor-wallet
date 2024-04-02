import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { WalletErrors } from 'src/common/constants/error-messages'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { StandardWalletRequestDto } from 'src/files/dto/standard-wallet-request.dto'
import { Wallet } from '../schemas/wallet.schema'

@Injectable()
export class WalletService {
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

  /**
   * Creates a wallet with userId
   */
  async createWallet(userId: string): Promise<StandardMessageResponse | any> {
    // Check if a wallet with the given userId already exists
    const existingWallet = await this.findWalletByUserId(userId)

    if (existingWallet !== null) {
      // Throw an exception if the wallet already exists
      throw new ConflictException(WalletErrors.WALLET_ALREADY_EXIST)
    }

    // Create a new wallet if it doesn't exist
    const wallet = new this.walletModel({ userId })
    const createdWallet = await wallet.save()
    return {
      data: createdWallet,
    }
  }

  /**
   * Deletes a wallet with userId or walletId
   */
  async deleteWallet(queryParams: StandardWalletRequestDto): Promise<StandardMessageResponse | any> {
    // Check if the wallet exists for the specified user
    let existingWallet
    if (queryParams.walletId != null) {
      existingWallet = await this.findWalletByWalletId(queryParams.walletId)
    } else {
      existingWallet = await this.findWalletByUserId(queryParams.userId)
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
