import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'
import { Wallet } from '../schemas/wallet.schema'
import { WalletReadService } from './wallet-read.service'

describe('WalletReadService', () => {
  let service: WalletReadService
  let walletModel: Model<Wallet>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletReadService,
        {
          provide: getModelToken('Wallet'),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<WalletReadService>(WalletReadService)
    walletModel = module.get<Model<Wallet>>(getModelToken('Wallet'))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // it('should return wallet details by userId', async () => {
  //   const walletDetails = {
  //     _id: 'walletId',
  //     userId: 'userId123',
  //   }
  //   jest.spyOn(walletModel, 'findOne').mockResolvedValue(walletDetails)

  //   const queryParams: StandardWalletRequestDto = { userId: 'userId123' }

  //   await expect(walletReadService.getWalletDetails(queryParams)).resolves.toEqual(walletDetails)
  // })

  // it('should return wallet details by walletId', async () => {
  //   const walletDetails = {
  //     _id: 'walletId123',
  //     userId: 'user123',
  //   }
  //   jest.spyOn(walletModel, 'findOne').mockResolvedValue(walletDetails)

  //   const queryParams = { walletId: 'walletId123' }
  //   await expect(walletReadService.getWalletDetails(queryParams)).resolves.toEqual(walletDetails)
  // })

  // it('should throw NotFoundException if wallet does not exist', async () => {
  //   const walletId = 'nonExistingId'
  //   jest.spyOn(walletModel, 'findOne').mockResolvedValue(null)

  //   const queryParams: StandardWalletRequestDto = { walletId }

  //   await expect(walletReadService.getWalletDetails(queryParams)).rejects.toThrowError(NotFoundException)
  // })
})
