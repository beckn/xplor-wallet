import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { VerifiableCredentialDeleteService } from './verifiable-credential-delete.service'
import { FilesDeleteService } from '../../files/service/files-delete.service'
import { ShareRequestDeleteService } from './share-request-delete.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { NotFoundException } from '@nestjs/common'
import { DeleteVCsRequestDto } from '../dto/get-vc-request.dto'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'
import { Model } from 'mongoose'
import { ConfigService } from 'aws-sdk'
import { AppModule } from '../../app.module'
import { FilesReadService } from '../../files/service/files-read.service'
import { FilesUpdateService } from '../../files/service/files-update.service'
import { S3StorageService } from '../../files/service/s3-storage.service'
import { RedisModule } from '../../redis/module/redis.module'
import { RedisService } from '../../redis/service/redis.service'
import { VCAccessControlCreateService } from '../../vc-access-control/service/verifiable-credential-access-control-create.service'
import { VCAccessControlReadService } from '../../vc-access-control/service/verifiable-credential-access-control-read.service'
import { VCAccessControlUpdateService } from '../../vc-access-control/service/verifiable-credential-access-control-update.service'
import { ShareRequestReadService } from './share-request-read.service'
import { VerifiableCredentialCreateService } from './verifiable-credential-create.service'
import { VerifiableCredentialReadService } from './verifiable-credential-read.service'
import { ApiClient } from '../../common/api-client'

describe('VerifiableCredentialDeleteService', () => {
  let service: VerifiableCredentialDeleteService
  let fileDeleteService: FilesDeleteService
  let shareRequestDeleteService: ShareRequestDeleteService
  let walletReadService: WalletReadService
  let vcModel: Model<VerifiableCredential>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule, AppModule],
      providers: [
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

    service = module.get<VerifiableCredentialDeleteService>(VerifiableCredentialDeleteService)
    fileDeleteService = module.get<FilesDeleteService>(FilesDeleteService)
    shareRequestDeleteService = module.get<ShareRequestDeleteService>(ShareRequestDeleteService)
    walletReadService = module.get<WalletReadService>(WalletReadService)
    vcModel = module.get(getModelToken('VerifiableCredential'))
  })

  describe('deleteVc', () => {
    it('should delete the specified verifiable credentials', async () => {
      const vcRequest: DeleteVCsRequestDto = {
        walletId: 'test_walletId',
        vcIds: ['vcId1', 'vcId2'],
      }

      const walletDetails = { data: {} }
      jest.spyOn(service['walletReadService'], 'getWalletDetails').mockResolvedValue(walletDetails)
      jest.spyOn(service['fileDeleteService'], 'deleteFileById').mockResolvedValue({ _id: 'fileId' } as any)
      const deletedVcs = [{ _id: 'vcId1' }, { _id: 'vcId2' }]
      jest.spyOn(service['vcModel'], 'findOneAndDelete').mockImplementation((async (query) => {
        const index = vcRequest.vcIds.indexOf(query._id as any)
        if (index !== -1) {
          return deletedVcs[0]
        }

        return null
      }) as any)

      jest.spyOn(fileDeleteService, 'deleteFileById').mockResolvedValue(true)
      jest.spyOn(shareRequestDeleteService, 'deleteShareRequestsByVcId').mockResolvedValue(true)

      const result = await service.deleteVc(vcRequest)

      expect(result.message).toEqual('OK')
      expect(result.success).toEqual(true)
    })

    it('should throw NotFoundException if wallet is not found', async () => {
      const vcRequest: DeleteVCsRequestDto = {
        walletId: 'invalid_walletId',
        vcIds: ['vcId1', 'vcId2'],
      }

      jest.spyOn(walletReadService, 'getWalletDetails').mockResolvedValue({ data: null })

      await expect(service.deleteVc(vcRequest)).rejects.toThrowError(NotFoundException)
    })

    // Add more test cases to cover other scenarios
  })
})
