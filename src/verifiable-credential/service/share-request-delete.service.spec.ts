import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { ShareRequestDeleteService } from './share-request-delete.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from 'aws-sdk'
import { FilesReadService } from '../../files/service/files-read.service'
import { FilesUpdateService } from '../../files/service/files-update.service'
import { S3StorageService } from '../../files/service/s3-storage.service'
import { RedisService } from '../../redis/service/redis.service'
import { VCAccessControlCreateService } from '../../vc-access-control/service/verifiable-credential-access-control-create.service'
import { VCAccessControlReadService } from '../../vc-access-control/service/verifiable-credential-access-control-read.service'
import { VCAccessControlUpdateService } from '../../vc-access-control/service/verifiable-credential-access-control-update.service'
import { ShareRequestCreateService } from './share-request-create.service'
import { ShareRequestReadService } from './share-request-read.service'
import { VerifiableCredentialReadService } from './verifiable-credential-read.service'
import * as redisMock from 'redis-mock'
import { AppModule } from '../../app.module'
import { RedisModule } from '../../redis/module/redis.module'
import { ShareRequest } from '../schemas/share-request.schema'
import { Model } from 'mongoose'
import { GrafanaLoggerService } from '../../grafana/service/grafana.service'
describe('ShareRequestDeleteService', () => {
  let service: ShareRequestDeleteService
  let walletReadService: WalletReadService
  let shareRequestModel: Model<ShareRequest>
  const redisClientMock = redisMock.createClient()
  const onSpy = jest.spyOn(redisClientMock, 'on')
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule, AppModule],
      providers: [
        GrafanaLoggerService,
        ShareRequestDeleteService,
        {
          provide: getModelToken('VerifiableCredential'),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken('ShareRequest'),
          useValue: {
            findById: jest.fn(),
            deleteMany: jest.fn(),
            findOneAndDelete: jest.fn(),
          },
        },
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
        {
          provide: WalletReadService,
          useValue: {
            findWalletByWalletId: jest.fn(),
            getWalletDetails: jest.fn(),
          },
        },
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

    service = module.get<ShareRequestDeleteService>(ShareRequestDeleteService)
    walletReadService = module.get<WalletReadService>(WalletReadService)
    shareRequestModel = module.get<Model<ShareRequest>>(getModelToken('ShareRequest'))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('deleteShareRequest', () => {
    it('should throw NotFoundException if wallet is not found', async () => {
      // Arrange
      const walletId = 'nonExistentId'
      jest.spyOn(walletReadService, 'getWalletDetails').mockResolvedValue({ data: null })

      // Act & Assert
      await expect(service.deleteShareRequest(walletId, 'requestId')).rejects.toThrowError(NotFoundException)
    })

    it('should throw NotFoundException if request is not found', async () => {
      // Arrange
      const walletId = 'validId'
      const requestId = 'nonExistentRequestId'
      jest.spyOn(walletReadService, 'getWalletDetails').mockResolvedValue({ data: {} })
      jest.spyOn(service['shareRequestModel'], 'findById').mockResolvedValue(null)

      // Act & Assert
      await expect(service.deleteShareRequest(walletId, requestId)).rejects.toThrowError(NotFoundException)
    })
  })

  describe('deleteShareRequestsByVcId', () => {
    it('should delete all share requests associated with the verifiable credential', async () => {
      // Arrange
      const vcId = 'validVcId'
      jest.spyOn(shareRequestModel, 'deleteMany').mockResolvedValue({ deletedCount: 2 } as any)

      // Act
      const result = await service.deleteShareRequestsByVcId(vcId)

      // Assert
      expect(result).toBeDefined()
      expect(result.message).toBe('OK')
    })
  })
})
