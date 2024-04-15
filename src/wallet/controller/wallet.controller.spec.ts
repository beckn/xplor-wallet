import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ApiClient } from '../../common/api-client'
import { WalletErrors } from '../../common/constants/error-messages'
import { StandardWalletRequestDto } from '../../files/dto/standard-wallet-request.dto'
import { CreateWalletRequestDto } from '../dto/create-wallet-request.dto'
import { WalletCreateService } from '../service/wallet-create.service'
import { WalletDeleteService } from '../service/wallet-delete.service'
import { WalletReadService } from '../service/wallet-read.service'
import { WalletEntity } from '../wallet.entity'
import { WalletController } from './wallet.controller'

describe('WalletController', () => {
  let walletController: WalletController
  let walletCreateService: WalletCreateService
  let walletReadService: WalletReadService
  let walletDeleteService: WalletDeleteService

  const mockCreateService = {
    createWallet: jest.fn(),
  }

  const mockDeleteService = {
    deleteWallet: jest.fn(),
  }

  const mockReadService = {
    getWalletDetails: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        { provide: WalletCreateService, useValue: mockCreateService },
        { provide: WalletReadService, useValue: mockReadService },
        { provide: ApiClient, useValue: {} },
        { provide: WalletDeleteService, useValue: mockDeleteService },
      ],
    }).compile()

    walletController = module.get<WalletController>(WalletController)
    walletCreateService = module.get<WalletCreateService>(WalletCreateService)
    walletReadService = module.get<WalletReadService>(WalletReadService)
    walletDeleteService = module.get<WalletDeleteService>(WalletDeleteService)
  })

  it('should be defined', () => {
    expect(walletController).toBeDefined()
  })

  describe('createWallet', () => {
    it('should create a wallet', async () => {
      const createWalletDto: CreateWalletRequestDto = {
        userId: 'user1234',
        fullName: 'Bhaskar Kaura',
        email: 'bhaskar@wits.com',
        organization: 'WIL',
      }
      const walletEntity = {
        userId: 'user1234',
      }
      jest.spyOn(walletCreateService, 'createWallet').mockResolvedValue(createWalletDto)

      const result = await walletController.createWallet(createWalletDto)
      expect(result).toHaveProperty('userId', walletEntity.userId)
    })

    it('should throw an error when Wallet already exists', async () => {
      const createWalletDto: CreateWalletRequestDto = {
        userId: 'user1234',
        fullName: 'Bhaskar Kaura',
        email: 'bhaskar@wits.com',
        organization: 'WIL',
      }
      const errorMessage = WalletErrors.WALLET_ALREADY_EXIST
      jest.spyOn(walletCreateService, 'createWallet').mockRejectedValue(new ConflictException(errorMessage))
      const result = walletController.createWallet(createWalletDto)
      await expect(result).rejects.toThrow(new ConflictException(errorMessage))
    })
  })

  describe('deleteWallet', () => {
    it('should delete a wallet', async () => {
      const deleteWalletDto: StandardWalletRequestDto = {
        walletId: 'user123',
      }
      const deletedWalletResult = {
        _id: 'user123',
      }
      jest.spyOn(walletDeleteService, 'deleteWallet').mockResolvedValue(deletedWalletResult)
      const result = await walletController.deleteWallet(deleteWalletDto)
      expect(result).toHaveProperty('_id', deletedWalletResult._id)
    })

    it('should throw an error when Wallet does not exists', async () => {
      const createWalletDto = {
        walletId: 'user1234',
      }
      const errorMessage = WalletErrors.WALLET_NOT_FOUND
      jest.spyOn(walletDeleteService, 'deleteWallet').mockRejectedValue(new NotFoundException(errorMessage))
      const result = walletController.deleteWallet(createWalletDto)
      await expect(result).rejects.toThrow(new NotFoundException(errorMessage))
    })
  })

  describe('getWalletDetails', () => {
    it('should get wallet details', async () => {
      const getWalletDetailsDto: StandardWalletRequestDto = {
        walletId: 'user123',
      }
      const walletEntity: WalletEntity = {
        _id: 'user123',
      }
      jest.spyOn(walletReadService, 'getWalletDetails').mockResolvedValue(walletEntity)

      const result = await walletController.getWalletDetails(getWalletDetailsDto)
      expect(result).toHaveProperty('_id', walletEntity._id)
    })

    it('should throw an error when Wallet does not exists', async () => {
      const createWalletDto = {
        walletId: 'user1234',
      }
      const errorMessage = WalletErrors.WALLET_NOT_FOUND
      jest.spyOn(walletReadService, 'getWalletDetails').mockRejectedValue(new NotFoundException(errorMessage))
      const result = walletController.getWalletDetails(createWalletDto)
      await expect(result).rejects.toThrow(new NotFoundException(errorMessage))
    })
  })
})
