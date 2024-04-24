import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { getModelToken } from '@nestjs/mongoose'
import { RedisService } from '../../redis/service/redis.service'
import { VCAccessControlReadService } from './verifiable-credential-access-control-read.service'
import { NotFoundException } from '@nestjs/common'
import { ViewAccessControlErrors } from '../../common/constants/error-messages'
import { Model } from 'mongoose'
import { VCAccessControl } from '../schemas/file-access-control.schema'
import { VerifiableCredentialReadService } from '../../verifiable-credential/service/verifiable-credential-read.service'
import { AppModule } from '../../app.module'
import { ApiClient } from '../../common/api-client'
import { FilesDeleteService } from '../../files/service/files-delete.service'
import { FilesReadService } from '../../files/service/files-read.service'
import { FilesUpdateService } from '../../files/service/files-update.service'
import { S3StorageService } from '../../files/service/s3-storage.service'
import { RedisModule } from '../../redis/module/redis.module'
import { ShareRequestDeleteService } from '../../verifiable-credential/service/share-request-delete.service'
import { ShareRequestReadService } from '../../verifiable-credential/service/share-request-read.service'
import { VerifiableCredentialCreateService } from '../../verifiable-credential/service/verifiable-credential-create.service'
import { VerifiableCredentialDeleteService } from '../../verifiable-credential/service/verifiable-credential-delete.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { VCAccessControlCreateService } from './verifiable-credential-access-control-create.service'
import { VCAccessControlUpdateService } from './verifiable-credential-access-control-update.service'
import { GrafanaLoggerService } from '../../grafana/service/grafana.service'
describe('VCAccessControlReadService', () => {
  let service: VCAccessControlReadService
  let modelMock: Model<VCAccessControl>
  let configServiceMock: ConfigService
  let redisServiceMock: RedisService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule, AppModule],
      providers: [
        GrafanaLoggerService,
        VCAccessControlReadService,
        ConfigService,
        RedisService,
        {
          provide: getModelToken('VCAccessControl'),
          useValue: {
            findOne: jest.fn(),
          },
        },
        VCAccessControlCreateService,
        ConfigService,
        RedisService,
        {
          provide: getModelToken('VCAccessControl'),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            save: jest.fn().mockResolvedValue({}),
          },
        },
        VerifiableCredentialDeleteService,
        FilesDeleteService,
        ShareRequestDeleteService,
        WalletReadService,
        {
          provide: ApiClient,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: getModelToken('VerifiableCredential'),
          useValue: {
            findOneAndDelete: jest.fn(),
          },
        },
        VerifiableCredentialCreateService,
        VCAccessControlCreateService,
        VCAccessControlUpdateService,
        WalletReadService,
        {
          provide: getModelToken('VerifiableCredential'),
          useValue: {
            new: jest.fn(),
            save: jest.fn(),
          },
        },
        ShareRequestDeleteService,
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
        {
          provide: getModelToken('VCAccessControl'),
          useValue: {},
        },
        {
          provide: getModelToken('VerifiableCredential'),
          useValue: {
            findById: jest.fn(),
          },
        },
        ShareRequestReadService,
        {
          provide: getModelToken('ShareRequest'),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: 'VerifiableCredential',
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: 'WalletReadService',
          useValue: {
            getWalletDetails: jest.fn(),
          },
        },
        {
          provide: 'FilesReadService',
          useValue: {
            getFileByIdWithoutStoredUrl: jest.fn(),
          },
        },
        ConfigService,
        VCAccessControlReadService,
        FilesUpdateService,
        ShareRequestReadService,
        RedisService,
        S3StorageService,
        VCAccessControlUpdateService,
        VCAccessControlCreateService,
        FilesReadService,
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
      ],
    }).compile()

    service = module.get<VCAccessControlReadService>(VCAccessControlReadService)
    modelMock = module.get<Model<VCAccessControl>>(getModelToken('VCAccessControl'))
    configServiceMock = module.get<ConfigService>(ConfigService)
    redisServiceMock = module.get<RedisService>(RedisService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findCachedByRestrictedKey', () => {
    it('should find ACL by restricted key', async () => {
      const restrictedKey = 'test_restricted_key'
      const aclResult = { _id: 'test_id' }
      jest.spyOn(redisServiceMock, 'getValue').mockResolvedValue(aclResult)

      const result = await service.findCachedByRestrictedKey(restrictedKey)

      expect(result).toEqual(aclResult)
      expect(redisServiceMock.getValue).toHaveBeenCalledWith(restrictedKey)
    })

    it('should throw NotFoundException if ACL is not found', async () => {
      const restrictedKey = 'test_restricted_key'
      jest.spyOn(redisServiceMock, 'getValue').mockResolvedValue(null)

      await expect(service.findCachedByRestrictedKey(restrictedKey)).rejects.toThrowError(NotFoundException)
      await expect(service.findCachedByRestrictedKey(restrictedKey)).rejects.toThrowError(
        ViewAccessControlErrors.ACL_NOT_FOUND,
      )
    })
  })

  describe('findByRestrictedUrl', () => {
    it('should find ACL by restricted URL', async () => {
      const restrictedUrl = 'test_restricted_url'
      const aclResult = { _id: 'test_id' }
      jest.spyOn(modelMock, 'findOne').mockResolvedValue(aclResult)

      const result = await service.findByRestrictedUrl(restrictedUrl)

      expect(result).toEqual(aclResult)
      expect(modelMock.findOne).toHaveBeenCalledWith({ restrictedUrl })
    })

    it('should throw NotFoundException if ACL is not found', async () => {
      const restrictedUrl = 'test_restricted_url'
      jest.spyOn(modelMock, 'findOne').mockResolvedValue(null)

      await expect(service.findByRestrictedUrl(restrictedUrl)).rejects.toThrowError(NotFoundException)
      await expect(service.findByRestrictedUrl(restrictedUrl)).rejects.toThrowError(
        ViewAccessControlErrors.ACL_NOT_FOUND,
      )
    })
  })

  describe('findByRestrictedKey', () => {
    it('should find ACL by restricted key', async () => {
      const restrictedKey = 'test_restricted_key'
      const aclResult = { _id: 'test_id' }
      jest.spyOn(modelMock, 'findOne').mockResolvedValue(aclResult)

      const result = await service.findByRestrictedKey(restrictedKey)

      expect(result).toEqual(aclResult)
      expect(modelMock.findOne).toHaveBeenCalledWith({ restrictedKey })
    })

    it('should throw NotFoundException if ACL is not found', async () => {
      const restrictedKey = 'test_restricted_key'
      jest.spyOn(modelMock, 'findOne').mockResolvedValue(null)

      await expect(service.findByRestrictedKey(restrictedKey)).rejects.toThrowError(NotFoundException)
      await expect(service.findByRestrictedKey(restrictedKey)).rejects.toThrowError(
        ViewAccessControlErrors.ACL_NOT_FOUND,
      )
    })
  })
})
