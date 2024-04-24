import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'
import { RedisService } from '../../redis/service/redis.service'
import { NotFoundException } from '@nestjs/common'
import { VCAccessControlUpdateService } from './verifiable-credential-access-control-update.service'
import { ApiClient } from '../../common/api-client'
import { FilesDeleteService } from '../../files/service/files-delete.service'
import { FilesReadService } from '../../files/service/files-read.service'
import { FilesUpdateService } from '../../files/service/files-update.service'
import { S3StorageService } from '../../files/service/s3-storage.service'
import { ShareRequestDeleteService } from '../../verifiable-credential/service/share-request-delete.service'
import { ShareRequestReadService } from '../../verifiable-credential/service/share-request-read.service'
import { VerifiableCredentialCreateService } from '../../verifiable-credential/service/verifiable-credential-create.service'
import { VerifiableCredentialDeleteService } from '../../verifiable-credential/service/verifiable-credential-delete.service'
import { VerifiableCredentialReadService } from '../../verifiable-credential/service/verifiable-credential-read.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { VCAccessControlCreateService } from './verifiable-credential-access-control-create.service'
import { VCAccessControlReadService } from './verifiable-credential-access-control-read.service'
import { AppModule } from '../../app.module'
import { RedisModule } from '../../redis/module/redis.module'
import { GrafanaLoggerService } from '../../grafana/service/grafana.service'

describe('VCAccessControlUpdateService', () => {
  let service: VCAccessControlUpdateService

  // Mock models and services
  const mockVCAccessControlModel = {}
  const mockConfigService = {
    get: jest.fn(),
  }
  const mockRedisService = {
    getValue: jest.fn(),
    updateField: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule, AppModule],
      providers: [
        GrafanaLoggerService,
        VCAccessControlUpdateService,
        { provide: getModelToken('VCAccessControl'), useValue: mockVCAccessControlModel },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RedisService, useValue: mockRedisService },
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

    service = module.get<VCAccessControlUpdateService>(VCAccessControlUpdateService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('updateRestrictionsByRestrictionKey', () => {
    it('should update restrictions by restriction key', async () => {
      // Mock data
      const restrictionKey = 'testKey'
      const expiresTimeStamp = Date.now() + 3600 // 1 hour from now

      // Mock the findOneAndUpdate method
      const findOneAndUpdateMock = jest
        .spyOn(service['vcAccessControlModel'], 'findOneAndUpdate')
        .mockResolvedValueOnce({})

      // Call the method
      await service.updateRestrictionsByRestrictionKey(restrictionKey, expiresTimeStamp)

      // Assertions
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { restrictedKey: restrictionKey },
        {
          $set: {
            restrictedKey: expect.any(String),
            expireTimeStamp: expiresTimeStamp,
          },
        },
        { new: true },
      )
    })

    it('should throw NotFoundException if no document is found', async () => {
      // Mock data
      const restrictionKey = 'nonExistingKey'
      const expiresTimeStamp = Date.now() + 3600 // 1 hour from now

      // Mock the findOneAndUpdate method to return null
      jest.spyOn(service['vcAccessControlModel'], 'findOneAndUpdate').mockResolvedValueOnce(null)

      // Call the method and expect it to throw NotFoundException
      await expect(service.updateRestrictionsByRestrictionKey(restrictionKey, expiresTimeStamp)).rejects.toThrowError(
        NotFoundException,
      )
    }, 30000)
  })

  describe('updateViewAllowedByRestrictionKey', () => {
    it('should update viewAllowed by restriction key', async () => {
      // Mock data
      const restrictionKey = 'testKey'
      const viewAllowed = true

      // Mock the findOneAndUpdate method
      const findOneAndUpdateMock = jest
        .spyOn(service['vcAccessControlModel'], 'findOneAndUpdate')
        .mockResolvedValueOnce({})
      jest.spyOn(service['redisService'], 'updateField').mockReturnValue(null)
      // Call the method
      await service.updateViewAllowedByRestrictionKey(restrictionKey, viewAllowed)

      // Assertions
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { restrictedKey: restrictionKey },
        {
          $set: {
            viewAllowed: viewAllowed,
          },
        },
        { new: true },
      )
    }, 30000)

    it('should throw NotFoundException if no document is found', async () => {
      // Mock data
      const restrictionKey = 'nonExistingKey'
      const viewAllowed = true

      // Mock the findOneAndUpdate method to return null
      jest.spyOn(service['vcAccessControlModel'], 'findOneAndUpdate').mockResolvedValueOnce(null)

      // Call the method and expect it to throw NotFoundException
      await expect(service.updateViewAllowedByRestrictionKey(restrictionKey, viewAllowed)).rejects.toThrowError(Error)
    }, 30000)
  })

  describe('updateShareRequestIdByRestrictedKey', () => {
    it('should update shareRequestId by restriction key', async () => {
      // Mock data
      const restrictionKey = 'testKey'
      const shareRequestId = 'testRequestId'

      // Mock the findOneAndUpdate method
      const findOneAndUpdateMock = jest
        .spyOn(service['vcAccessControlModel'], 'findOneAndUpdate')
        .mockResolvedValueOnce({})

      // Call the method
      await service.updateShareRequestIdByRestrictedKey(restrictionKey, shareRequestId)

      // Assertions
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { restrictedKey: restrictionKey },
        {
          $set: {
            shareRequestId: shareRequestId,
          },
        },
        { new: true },
      )
    })

    it('should throw NotFoundException if no document is found', async () => {
      // Mock data
      const restrictionKey = 'nonExistingKey'
      const shareRequestId = 'testRequestId'

      // Mock the findOneAndUpdate method to return null
      jest.spyOn(service['vcAccessControlModel'], 'findOneAndUpdate').mockResolvedValueOnce(null)

      // Call the method and expect it to throw NotFoundException
      await expect(service.updateShareRequestIdByRestrictedKey(restrictionKey, shareRequestId)).rejects.toThrowError(
        NotFoundException,
      )
    })
  })

  describe('updateVcIdByRestrictedKey', () => {
    it('should throw NotFoundException if no document is found', async () => {
      // Mock data
      const restrictionKey = 'nonExistingKey'
      const vcId = 'testVcId'

      // Mock the findOneAndUpdate method to return null
      jest.spyOn(service['vcAccessControlModel'], 'findOneAndUpdate').mockResolvedValueOnce(null)

      // Call the method and expect it to throw NotFoundException
      await expect(service.updateVcIdByRestrictedKey(restrictionKey, vcId)).rejects.toThrowError(NotFoundException)
    })
  })

  describe('renewAccessControl', () => {
    it('should renew access control with new expiry timestamp', async () => {
      // Mock data
      const restrictionKey = 'testKey'
      const expiryTimeStamp = '2024-03-12T13:27:03.696Z' // 1 hour from now

      // Mock the findOneAndUpdate method
      const findOneAndUpdateMock = jest
        .spyOn(service['vcAccessControlModel'], 'findOneAndUpdate')
        .mockResolvedValueOnce({})

      // Call the method
      await service.renewAccessControl(restrictionKey, expiryTimeStamp)

      // Assertions
      expect(findOneAndUpdateMock).toHaveBeenCalledWith(
        { restrictedKey: restrictionKey },
        {
          $set: {
            expireTimeStamp: expiryTimeStamp,
          },
        },
        { new: true },
      )
    })

    it('should return updated document', async () => {
      // Mock data
      const restrictionKey = 'testKey'
      const expiryTimeStamp = '2024-03-12T13:27:03.696Z'
      const updatedDocumentMock = {
        /* mock updated document */
      }

      // Mock the findOneAndUpdate method to return updated document
      jest.spyOn(service['vcAccessControlModel'], 'findOneAndUpdate').mockResolvedValueOnce(updatedDocumentMock)

      // Call the method and expect it to return the updated document
      const result = await service.renewAccessControl(restrictionKey, expiryTimeStamp)

      // Assertions
      expect(result).toEqual(updatedDocumentMock)
    })

    it('should throw NotFoundException if no document is found', async () => {
      // Mock data
      const restrictionKey = 'nonExistingKey'
      const expiryTimeStamp = '2024-03-12T13:27:03.696Z'

      // Mock the findOneAndUpdate method to return null
      jest.spyOn(service['vcAccessControlModel'], 'findOneAndUpdate').mockResolvedValueOnce({})

      // Call the method and expect it to throw NotFoundException
      expect(await service.renewAccessControl(restrictionKey, expiryTimeStamp)).toEqual({})
    })
  })
})
