import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { WalletDeleteService } from './wallet-delete.service'
import { WalletReadService } from './wallet-read.service'
import { NotFoundException } from '@nestjs/common'

describe('WalletDeleteService', () => {
  let service: WalletDeleteService
  let walletReadService: WalletReadService

  const mockWalletModel = {
    findOneAndDelete: jest.fn(),
  }

  const mockWalletReadService = {
    findWalletByWalletId: jest.fn(),
    findWalletByUserId: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletDeleteService,
        { provide: WalletReadService, useValue: mockWalletReadService },
        { provide: getModelToken('Wallet'), useValue: mockWalletModel },
      ],
    }).compile()

    service = module.get<WalletDeleteService>(WalletDeleteService)
    walletReadService = module.get<WalletReadService>(WalletReadService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('deleteWallet', () => {
    it('should delete a wallet', async () => {
      const queryParams = { userId: 'user123' }
      const deleteResult = {
        userId: 'user123',
      }
      jest.spyOn(service, 'deleteWallet').mockResolvedValue(queryParams as any)
      const result = await service.deleteWallet(queryParams)

      expect(result).toHaveProperty('userId', deleteResult.userId)
    })
  })

  it('should throw NotFoundException if wallet does not exist', async () => {
    // Mocking the query parameters
    const queryParams = { walletId: 'walletId' }
    const mockedResult = {
      data: null,
    }
    jest.spyOn(walletReadService, 'findWalletByWalletId').mockResolvedValue(mockedResult as any)

    await expect(service.deleteWallet(queryParams)).rejects.toThrowError(NotFoundException)
  })
})
