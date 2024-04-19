import { Test, TestingModule } from '@nestjs/testing'
import { ShareRequestCreateService } from './share-request-create.service'
import { VerifiableCredentialReadService } from './verifiable-credential-read.service'
import { VCAccessControlUpdateService } from '../../vc-access-control/service/verifiable-credential-access-control-update.service'
import { VCAccessControlCreateService } from '../../vc-access-control/service/verifiable-credential-access-control-create.service'
import { FilesReadService } from '../../files/service/files-read.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { getModelToken } from '@nestjs/mongoose'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ShareRequestAction } from '../../common/constants/enums'
import { ConfigService } from '@nestjs/config'
import { VCAccessControlReadService } from '../../vc-access-control/service/verifiable-credential-access-control-read.service'
import { FilesUpdateService } from '../../files/service/files-update.service'
import { ShareRequestReadService } from './share-request-read.service'
import { RedisService } from '../../redis/service/redis.service'
import { S3StorageService } from '../../files/service/s3-storage.service'
import { RedisModule } from '../../redis/module/redis.module'
import { AppModule } from '../../app.module'
import * as redisMock from 'redis-mock'

describe('ShareRequestCreateService', () => {
  let service: ShareRequestCreateService
  let vcReadService: VerifiableCredentialReadService
  let vcAclUpdateService: VCAccessControlUpdateService
  let vcAclCreateService: VCAccessControlCreateService
  let filesReadService: FilesReadService
  let walletReadService: WalletReadService
  let configServiceMock: ConfigService
  const redisClientMock = redisMock.createClient()
  const onSpy = jest.spyOn(redisClientMock, 'on')
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule, AppModule],
      providers: [
        ShareRequestCreateService,
        {
          provide: VerifiableCredentialReadService,
          useValue: {
            getVCById: jest.fn().mockReturnValue({ _id: 'vcId' }),
          },
        },
        VCAccessControlUpdateService,
        VCAccessControlCreateService,
        FilesReadService,
        WalletReadService,
        ConfigService,
        VCAccessControlReadService,
        FilesUpdateService,
        ShareRequestReadService,
        RedisService,
        S3StorageService,
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            redisClientMock,
            on: onSpy,
          },
        },
        {
          provide: getModelToken('VCAccessControl'),
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getModelToken('Wallet'),
          useValue: {},
        },
        {
          provide: getModelToken('File'),
          useValue: {},
        },
        {
          provide: getModelToken('VerifiableCredential'),
          useValue: {
            findOne: jest.fn().mockReturnValue({ _id: 'vcId' }),
          },
        },
        {
          provide: getModelToken('ShareRequest'),
          useValue: {
            findById: jest.fn().mockReturnValue({ _id: 'requestId' }),
          },
        },
      ],
    }).compile()

    service = module.get<ShareRequestCreateService>(ShareRequestCreateService)
    vcReadService = module.get<VerifiableCredentialReadService>(VerifiableCredentialReadService)
    vcAclUpdateService = module.get<VCAccessControlUpdateService>(VCAccessControlUpdateService)
    vcAclCreateService = module.get<VCAccessControlCreateService>(VCAccessControlCreateService)
    filesReadService = module.get<FilesReadService>(FilesReadService)
    walletReadService = module.get<WalletReadService>(WalletReadService)
    configServiceMock = module.get<ConfigService>(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('shareVCs', () => {
    it('should throw NotFoundException when wallet is not found', async () => {
      const vcIds = ['vcId1', 'vcId2']
      const walletId = 'invalidWalletId'
      const shareRequest = {
        requestedFromWallet: 'invalidRequestedFromWallet',
        certificateType: 'certificateType',
        remarks: 'remarks',
        restrictions: { expiresIn: 24, viewOnce: false },
      }
      await expect(service.shareVCs(vcIds, walletId, shareRequest)).rejects.toThrowError(NotFoundException)
    })

    // Add more test cases for different scenarios
  })

  describe('requestShareFile', () => {
    it('should throw NotFoundException when wallet or requestedFromWallet is not found', async () => {
      const walletId = 'invalidWalletId'
      const shareRequest = {
        requestedFromWallet: 'invalidRequestedFromWallet',
        certificateType: 'certificateType',
        remarks: 'remarks',
        restrictions: null,
      }
      await expect(service.requestShareFile(walletId, shareRequest)).rejects.toThrowError(NotFoundException)
    })

    // Add more test cases for different scenarios
  })

  describe('deleteShareRequest', () => {
    it('should throw NotFoundException when request is not found', async () => {
      const userId = 'userId'
      const requestId = 'invalidRequestId'
      await expect(service.deleteShareRequest(userId, requestId)).rejects.toThrowError(NotFoundException)
    })

    it('should throw UnauthorizedException when the request owner is different from the user id', async () => {
      const userId = 'userId1'
      const requestId = 'requestId1'
      const mockRequest = {
        _id: requestId,
        raisedByWallet: 'userId2', // Different user ID
      }
      jest.spyOn(service['shareRequestModel'], 'findById').mockResolvedValueOnce(mockRequest as any)
      await expect(service.deleteShareRequest(userId, requestId)).rejects.toThrowError(UnauthorizedException)
    })

    // Add more test cases for different scenarios
  })

  describe('respondToShareRequest', () => {
    it('should throw NotFoundException when request or VC is not found', async () => {
      const walletId = 'walletId'
      const requestId = 'invalidRequestId'
      const vcId = 'invalidVcId'
      const action = ShareRequestAction.ACCEPTED
      await expect(service.respondToShareRequest(walletId, requestId, vcId, action)).rejects.toThrowError(
        NotFoundException,
      )
    })

    it('should throw UnauthorizedException when the VC owner is different from the wallet id', async () => {
      const walletId = 'walletId1'
      const requestId = 'requestId'
      const vcId = 'vcId1'
      const action = ShareRequestAction.ACCEPTED
      const mockRequest = {
        _id: requestId,
        vcOwnerWallet: 'walletId2', // Different wallet ID
      }
      jest.spyOn(vcReadService, 'getVCById').mockResolvedValueOnce({ _id: 'vcId' })
      jest.spyOn(service['shareRequestModel'], 'findOne').mockResolvedValueOnce(mockRequest as any)
      await expect(service.respondToShareRequest(walletId, requestId, vcId, action)).rejects.toThrowError(
        UnauthorizedException,
      )
    })

    // Add more test cases for different scenarios
  })
})
