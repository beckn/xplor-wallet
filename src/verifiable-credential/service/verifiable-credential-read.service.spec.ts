import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { Model } from 'mongoose'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { VerifiableCredentialReadService } from './verifiable-credential-read.service'
import { VCAccessControlReadService } from '../../vc-access-control/service/verifiable-credential-access-control-read.service'
import { VCAccessControlUpdateService } from '../../vc-access-control/service/verifiable-credential-access-control-update.service'
import { FilesReadService } from '../../files/service/files-read.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { FilesUpdateService } from '../../files/service/files-update.service'
import { ShareRequestReadService } from './share-request-read.service'
import { GetVCListRequestDto } from '../dto/get-vc-list-request.dto'
import { GetVCRequestDto } from '../dto/get-vc-request.dto'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'
import { getModelToken } from '@nestjs/mongoose'
import { VCAccessControlCreateService } from '../../vc-access-control/service/verifiable-credential-access-control-create.service'
import { AppModule } from '../../app.module'
import { ApiClient } from '../../common/api-client'
import { FilesDeleteService } from '../../files/service/files-delete.service'
import { S3StorageService } from '../../files/service/s3-storage.service'
import { RedisModule } from '../../redis/module/redis.module'
import { RedisService } from '../../redis/service/redis.service'
import { ShareRequestDeleteService } from './share-request-delete.service'
import { VerifiableCredentialCreateService } from './verifiable-credential-create.service'
import { VerifiableCredentialDeleteService } from './verifiable-credential-delete.service'
import { GrafanaLoggerService } from '../../grafana/service/grafana.service'

describe('VerifiableCredentialReadService', () => {
  let service: VerifiableCredentialReadService
  let vcModel: Model<VerifiableCredential>
  let configService: ConfigService
  let vcAclReadService: VCAccessControlReadService
  let vcAclUpdateService: VCAccessControlUpdateService
  let filesReadService: FilesReadService
  let walletReadService: WalletReadService
  let filesUpdateService: FilesUpdateService
  let shareRequestReadService: ShareRequestReadService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule, AppModule],
      providers: [
        GrafanaLoggerService,
        VerifiableCredentialReadService,
        {
          provide: getModelToken('VerifiableCredential'),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        ConfigService,
        VCAccessControlReadService,
        VCAccessControlUpdateService,
        FilesReadService,
        WalletReadService,
        FilesUpdateService,
        ShareRequestReadService,
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

    service = module.get<VerifiableCredentialReadService>(VerifiableCredentialReadService)
    vcModel = module.get<Model<VerifiableCredential>>(getModelToken('VerifiableCredential'))
    configService = module.get<ConfigService>(ConfigService)
    vcAclReadService = module.get<VCAccessControlReadService>(VCAccessControlReadService)
    vcAclUpdateService = module.get<VCAccessControlUpdateService>(VCAccessControlUpdateService)
    filesReadService = module.get<FilesReadService>(FilesReadService)
    walletReadService = module.get<WalletReadService>(WalletReadService)
    filesUpdateService = module.get<FilesUpdateService>(FilesUpdateService)
    shareRequestReadService = module.get<ShareRequestReadService>(ShareRequestReadService)
  })

  describe('getVCByIdAndWalletId', () => {
    it('should return VC details by ID and wallet ID', async () => {
      const queryParams: GetVCRequestDto = {
        walletId: 'test_walletId',
        vcId: 'test_vcId',
      }
      const walletDetails = { data: { _id: 'walletId' } }
      jest.spyOn(service['walletReadService'], 'getWalletDetails').mockResolvedValue(walletDetails)
      const vcDetails = { _id: 'test_vcId', fileId: 'fileId1', toJSON: jest.fn().mockReturnThis() }
      jest.spyOn(service['vcModel'], 'findOne').mockResolvedValue(vcDetails)
      jest.spyOn(service['filesReadService'], 'getFileById').mockResolvedValue({ _id: 'fileId', fileType: 'pdf' })
      const result = await service.getVCByIdAndWalletId(queryParams)

      expect(result).toEqual(expect.objectContaining({ data: expect.any(Object) }))
    })

    it('should throw NotFoundException if VC is not found', async () => {
      const queryParams: GetVCRequestDto = {
        walletId: 'test_walletId',
        vcId: 'test_vcId',
      }
      const walletDetails = { data: { _id: 'walletId' } }
      jest.spyOn(service['walletReadService'], 'getWalletDetails').mockResolvedValue(walletDetails)
      jest.spyOn(service['vcModel'], 'findOne').mockResolvedValue(null)

      await expect(service.getVCByIdAndWalletId(queryParams)).rejects.toThrowError(NotFoundException)
    })
  })

  describe('getVCById', () => {
    it('should return VC details by ID', async () => {
      const vcId = 'test_vcId'
      const vcDetails = { _id: 'test_vcId', fileId: 'fileId1', toJSON: jest.fn().mockReturnThis() }
      jest.spyOn(vcModel, 'findOne').mockResolvedValue(vcDetails)
      jest.spyOn(service['filesReadService'], 'getFileById').mockResolvedValue({ fileType: 'pdf' })

      const result = await service.getVCById(vcId)

      expect(result).toEqual(expect.objectContaining({ data: expect.any(Object) }))
      expect(vcModel.findOne).toHaveBeenCalledWith(expect.objectContaining({ _id: vcId }))
    }, 30000)

    it('should throw NotFoundException if VC is not found', async () => {
      const vcId = 'test_vcId'
      jest.spyOn(service['vcModel'], 'findOne').mockResolvedValue(null)

      await expect(service.getVCById(vcId)).rejects.toThrowError(NotFoundException)
    })
  })
})
