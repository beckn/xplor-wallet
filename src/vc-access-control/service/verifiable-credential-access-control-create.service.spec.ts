import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { getModelToken } from '@nestjs/mongoose'
import { RedisService } from '../../redis/service/redis.service'
import { VCAccessControlCreateService } from './verifiable-credential-access-control-create.service'
import { CreateAccessControlDto } from '../dto/create-access-control.dto'
import { VCAccessControl } from '../schemas/file-access-control.schema'
import { InternalServerErrorException } from '@nestjs/common'
import { Model } from 'mongoose'
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
import { VerifiableCredentialReadService } from '../../verifiable-credential/service/verifiable-credential-read.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { VCAccessControlReadService } from './verifiable-credential-access-control-read.service'
import { VCAccessControlUpdateService } from './verifiable-credential-access-control-update.service'
import { GrafanaLoggerService } from '../../grafana/service/grafana.service'
import { UrlShortenerUtil } from '../../utils/url-shortner.util'
describe('VCAccessControlCreateService', () => {
  let service: VCAccessControlCreateService
  let modelMock: Model<VCAccessControl>
  let configServiceMock: ConfigService
  let redisServiceMock: RedisService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule, AppModule],
      providers: [
        GrafanaLoggerService,
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
        {
          provide: UrlShortenerUtil,
          useValue: {
            createShortUrl: jest.fn().mockReturnValue({
              data: {
                shortUrl: 'https://shorturl.com/',
              },
            }),
          },
        },
      ],
    }).compile()

    service = module.get<VCAccessControlCreateService>(VCAccessControlCreateService)
    modelMock = module.get<Model<VCAccessControl>>(getModelToken('VCAccessControl'))
    configServiceMock = module.get<ConfigService>(ConfigService)
    redisServiceMock = module.get<RedisService>(RedisService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createVcAccessControl', () => {
    it('should create VC access control record', async () => {
      const vcId = 'test_vcId'
      const shareRequestId = 'test_shareRequestId'
      const expiresTimeStamp = '2024-04-15T12:00:00Z'
      const viewOnce = true
      const restrictedKey = 'test_restrictedKey'
      const restrictedUrl = 'test_restrictedUrl'
      const accessModelDto = new CreateAccessControlDto(
        vcId,
        shareRequestId,
        restrictedKey,
        restrictedUrl,
        expiresTimeStamp,
        viewOnce,
        true,
      )

      jest.spyOn(configServiceMock, 'get').mockReturnValue('test_wallet_service_url')
      jest.spyOn(modelMock.prototype, 'save').mockReturnValue({ restrictedKey: 'key', _id: 'acl_id' } as any as any)
      jest.spyOn(redisServiceMock, 'setWithExpiry').mockResolvedValue({ restrictedKey: 'key', _id: 'acl_id' } as any)
      jest.spyOn(service['urlShortner'], 'createShortUrl').mockReturnValue({
        data: {
          shortUrl: 'https://shorturl.com/',
        },
      } as any)
      const result = await service.createVcAccessControl(vcId, shareRequestId, expiresTimeStamp, viewOnce)

      expect(result).toBeDefined()
      expect(redisServiceMock.setWithExpiry).toHaveBeenCalled()
    })

    it('should throw InternalServerErrorException if creation fails', async () => {
      const vcId = 'test_vcId'
      const shareRequestId = 'test_shareRequestId'
      const expiresTimeStamp = '2024-04-15T12:00:00Z'
      const viewOnce = true

      jest.spyOn(modelMock.prototype, 'save').mockRejectedValueOnce(new InternalServerErrorException())
      jest.spyOn(service['urlShortner'], 'createShortUrl').mockReturnValue({
        data: {
          shortUrl: 'https://shorturl.com/',
        },
      } as any)

      await expect(
        service.createVcAccessControl(vcId, shareRequestId, expiresTimeStamp, viewOnce),
      ).rejects.toThrowError(new InternalServerErrorException())
    })
  })
})
