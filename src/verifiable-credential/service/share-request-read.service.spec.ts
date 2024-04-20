import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ShareRequestReadService } from './share-request-read.service'
import { getModelToken } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ShareRequest } from '../schemas/share-request.schema'
import { AppModule } from '../../app.module'
import { RedisModule } from '../../redis/module/redis.module'
import { ConfigService } from 'aws-sdk'
import { FilesReadService } from '../../files/service/files-read.service'
import { FilesUpdateService } from '../../files/service/files-update.service'
import { S3StorageService } from '../../files/service/s3-storage.service'
import { RedisService } from '../../redis/service/redis.service'
import { VCAccessControlCreateService } from '../../vc-access-control/service/verifiable-credential-access-control-create.service'
import { VCAccessControlReadService } from '../../vc-access-control/service/verifiable-credential-access-control-read.service'
import { VCAccessControlUpdateService } from '../../vc-access-control/service/verifiable-credential-access-control-update.service'
import { ShareRequestDeleteService } from './share-request-delete.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { VerifiableCredentialReadService } from './verifiable-credential-read.service'
import { ShareRequestAction } from '../../common/constants/enums'

describe('ShareRequestReadService', () => {
  let service: ShareRequestReadService
  let shareRequestModel: Model<ShareRequest>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule, AppModule],
      providers: [
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

    service = module.get<ShareRequestReadService>(ShareRequestReadService)
    shareRequestModel = module.get<Model<ShareRequest>>(getModelToken('ShareRequest'))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getShareRequestsList', () => {
    it('should return share requests list based on given filters', async () => {
      // Mock data
      const walletId = 'validWalletId'
      const queries = {
        shareType: 'RECEIVED',
        walletId: 'walletId',
        documentType: 'CERTIFICATE',
        status: 'PENDING',
        page: 1,
        pageSize: 10,
      }
      const shareRequests = [
        {
          _id: 'requestId1',
          vcId: 'vcId',
          status: ShareRequestAction.ACCEPTED, // Add status property
        },
        {
          _id: 'requestId2',
          vcId: 'vcId',
          status: ShareRequestAction.ACCEPTED, // Add status property
        },
      ]
      const expResponse = { data: { _id: 'vcId', fileId: 'fileId' } }
      // Mock service methods
      jest.spyOn(service['walletReadService'], 'getWalletDetails').mockResolvedValue({ data: { _id: walletId } } as any)
      jest.spyOn(service['vcModel'], 'findOne').mockResolvedValue({ data: { _id: 'vcId', fileId: 'fileId' } } as any)
      jest
        .spyOn(service['filesReadService'], 'getFileByIdWithoutStoredUrl')
        .mockResolvedValue({ data: { _id: 'fileId' } } as any)
      jest.spyOn(service['shareRequestModel'], 'find').mockReturnValue({
        skip: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue(shareRequests as any) }),
      } as any)
      // Call the method
      const result = await service.getShareRequestsList(walletId, queries as any)

      // Assertions
      expect(result.data).toHaveProperty('[0].vcDetails', expResponse)
    })

    it('should throw NotFoundException if wallet not found', async () => {
      const walletId = 'invalidWalletId'
      const queries = { walletId }

      jest.spyOn(service['walletReadService'], 'getWalletDetails').mockResolvedValue({ data: null })

      await expect(service.getShareRequestsList(walletId, queries as any)).rejects.toThrowError(NotFoundException)
    })
  })

  describe('getShareRequestsById', () => {
    it('should return share request if found', async () => {
      const requestId = 'validRequestId'
      const shareRequest = { _id: requestId }

      jest.spyOn(shareRequestModel, 'findOne').mockResolvedValue(shareRequest as any)

      const result = await service.getShareRequestsById(requestId)

      expect(result).toEqual(shareRequest)
    })

    it('should throw NotFoundException if share request not found', async () => {
      const requestId = 'invalidRequestId'

      jest.spyOn(shareRequestModel, 'findOne').mockResolvedValue(null)

      await expect(service.getShareRequestsById(requestId)).rejects.toThrowError(NotFoundException)
    })
  })
})
