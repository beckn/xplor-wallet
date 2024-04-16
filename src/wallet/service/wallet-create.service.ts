import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ApiClient } from '../../common/api-client'
import { WalletErrors } from '../../common/constants/error-messages'
import { HttpResponseMessage } from '../../common/constants/http-response-message'
import { RegistryRequestRoutes } from '../../common/constants/request-routes'
import { StandardMessageResponse } from '../../common/constants/standard-message-response.dto'
import { getSuccessResponse } from '../../utils/get-success-response'
import { CreateRegistryUserDIDRequestDto, DIDDetails } from '../dto/create-user-did-request.dto'
import { CreateWalletModelDto } from '../dto/create-wallet-model.dto'
import { CreateWalletRequestDto } from '../dto/create-wallet-request.dto'
import { Wallet } from '../schemas/wallet.schema'
import { WalletReadService } from './wallet-read.service'

@Injectable()
export class WalletCreateService {
  constructor(
    @InjectModel('Wallet') private readonly walletModel: Model<Wallet>,
    private readonly configService: ConfigService,
    private readonly walletReadService: WalletReadService,
    private readonly apiClient: ApiClient,
  ) {}

  /**
   * Creates a wallet with userId
   */
  async createWallet(request: CreateWalletRequestDto): Promise<StandardMessageResponse | any> {
    // Check if a wallet with the given userId already exists
    const existingWallet = await this.walletReadService.findWalletByUserId(request.userId)
    if (existingWallet['data'] !== null) {
      // Throw an exception if the wallet already exists
      throw new ConflictException(WalletErrors.WALLET_ALREADY_EXIST)
    }

    const registryRequestBody = new CreateRegistryUserDIDRequestDto(
      new DIDDetails(request.fullName, request.email),
      request.organization,
    )
    const createRegistryUser = await this.apiClient.post(
      this.configService.get('REGISTRY_SERVICE_URL') + RegistryRequestRoutes.GENERATE_DID,
      registryRequestBody,
    )

    if (createRegistryUser == null) {
      throw new BadRequestException(WalletErrors.WALLET_BAD_REQUEST)
    }

    const createWalletModel = new CreateWalletModelDto(request.userId, createRegistryUser[0]['id'])
    // Create a new wallet if it doesn't exist
    const wallet = new this.walletModel(createWalletModel)
    const createdWallet = await wallet.save()
    return getSuccessResponse(await createdWallet, HttpResponseMessage.OK)
  }
}
