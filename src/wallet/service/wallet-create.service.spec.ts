import { ConfigService } from '@nestjs/config'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'
import { ApiClient } from '../../common/api-client'
import { Wallet } from '../schemas/wallet.schema'
import { WalletCreateService } from './wallet-create.service'
import { WalletReadService } from './wallet-read.service'
import { BadRequestException, ConflictException } from '@nestjs/common'
import { Types } from 'mongoose'
describe('WalletCreateService', () => {
  let service: WalletCreateService
  let walletReadService: WalletReadService
  let apiClient: ApiClient
  let walletModel: Model<Wallet>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletCreateService,
        ConfigService,
        WalletReadService,
        ApiClient,
        {
          provide: getModelToken('Wallet'),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn().mockReturnThis(),
          },
        },
        {
          provide: ApiClient,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<WalletCreateService>(WalletCreateService)
    walletReadService = module.get<WalletReadService>(WalletReadService)
    apiClient = module.get<ApiClient>(ApiClient)
    walletModel = module.get<Model<Wallet>>(getModelToken('Wallet'))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createWallet', () => {
    it('should create a wallet', async () => {
      const request = {
        userId: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
        organization: 'ACME Corp',
      }

      const existingWallet = {
        data: null,
      }
      jest.spyOn(walletReadService, 'findWalletByUserId').mockResolvedValue(existingWallet as any)

      const createRegistryUserResponse = [{ id: '123456' }]
      jest.spyOn(apiClient, 'post').mockResolvedValue(createRegistryUserResponse)

      const createWalletModel = {
        _id: new Types.ObjectId(),
        userId: request.userId,
        did: createRegistryUserResponse[0].id,
      }

      jest.spyOn(walletModel, 'create').mockResolvedValue(createWalletModel as any)

      const result = await service.createWallet(request)

      expect(result.data).toEqual(createWalletModel)
    })

    it('should throw ConflictException if wallet with userId already exists', async () => {
      const request = {
        userId: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
        organization: 'ACME Corp',
      }

      const existingWallet = { data: { userId: 'user123' } }
      jest.spyOn(walletReadService, 'findWalletByUserId').mockResolvedValue(existingWallet as any)

      await expect(service.createWallet(request)).rejects.toThrow(ConflictException)
    })

    it('should throw BadRequestException if registry service response is null', async () => {
      const request = {
        userId: 'user123',
        fullName: 'John Doe',
        email: 'john@example.com',
      }

      const existingWallet = {
        data: null,
      }
      jest.spyOn(walletReadService, 'findWalletByUserId').mockResolvedValue(existingWallet as any)

      jest.spyOn(apiClient, 'post').mockResolvedValue(null)

      await expect(service.createWallet(request)).rejects.toThrow(BadRequestException)
    })
  })
})
