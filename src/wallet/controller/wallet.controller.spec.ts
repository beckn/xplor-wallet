import { Test, TestingModule } from '@nestjs/testing'
import { ApiClient } from '../../common/api-client'
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        { provide: WalletCreateService, useValue: {} },
        { provide: WalletReadService, useValue: {} },
        { provide: ApiClient, useValue: {} },
        { provide: WalletDeleteService, useValue: {} },
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
        userId: 'user123',
        fullName: 'Bhaskar Kaura',
        email: 'bhaskar@wits.com',
        organization: 'WIL',
      }
      const walletEntity: WalletEntity = {
        _id: 'ok',
        userId: 'user123',
        userDid: 'did:user123',
        createdAt: undefined,
        updatedAt: undefined,
      }
      jest.spyOn(walletCreateService, 'createWallet').mockResolvedValue(walletEntity)

      expect(await walletController.createWallet(createWalletDto)).toEqual(walletEntity)
    })
  })

  describe('deleteWallet', () => {
    it('should delete a wallet', async () => {
      const deleteWalletDto: StandardWalletRequestDto = {
        /* your test data here */
      }
      const result = {
        /* your mock result here */
      }
      jest.spyOn(walletDeleteService, 'deleteWallet').mockResolvedValue(result)

      expect(await walletController.deleteWallet(deleteWalletDto)).toEqual(result)
    })
  })

  describe('getWalletDetails', () => {
    it('should get wallet details', async () => {
      const getWalletDetailsDto: StandardWalletRequestDto = {
        /* your test data here */
      }
      const walletEntity: WalletEntity = {
        _id: '',
        userId: '',
        userDid: '',
        createdAt: undefined,
        updatedAt: undefined,
      }
      jest.spyOn(walletReadService, 'getWalletDetails').mockResolvedValue(walletEntity)

      expect(await walletController.getWalletdetails(getWalletDetailsDto)).toEqual(walletEntity)
    })
  })
})
