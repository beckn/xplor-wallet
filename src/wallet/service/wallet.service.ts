import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { Wallet } from '../schemas/wallet.schema'

@Injectable()
export class WalletService {
  constructor(@InjectModel('Wallet') private readonly walletModel: Model<Wallet>) {}

  async findWalletByUserId(userId: string): Promise<Wallet> {
    return this.walletModel.findOne({ userId }).exec()
  }

  async getWalletDetails(userId: string): Promise<StandardMessageResponse> {
    const walletDetails = await this.findWalletByUserId(userId)
    // Check if the wallet does not exist with the userId
    if (walletDetails == null) {
      throw new NotFoundException('Wallet with this user does not exists.')
    }

    return {
      data: walletDetails,
    }
  }
  async createWallet(userId: string): Promise<StandardMessageResponse> {
    // Check if a wallet with the given userId already exists
    const existingWallet = await this.findWalletByUserId(userId)

    if (existingWallet !== null) {
      // Throw an exception if the wallet already exists
      throw new ConflictException('Wallet with this user already exists.')
    }

    // Create a new wallet if it doesn't exist
    const wallet = new this.walletModel({ userId })
    const createdWallet = await wallet.save()
    return {
      data: createdWallet,
    }
  }

  async deleteWallet(userId: string): Promise<StandardMessageResponse> {
    // Check if the wallet exists for the specified user
    const existingWallet = await this.findWalletByUserId(userId)
    if (!existingWallet) {
      // Throw an exception if the wallet doesn't exist
      throw new NotFoundException('Wallet not found for this user.')
    }

    // If the wallet exists, delete it
    const result = await this.walletModel.findOneAndDelete({ userId })

    return {
      data: result,
    }
  }
}
