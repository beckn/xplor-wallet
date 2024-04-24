import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { VerifiableCredentialCreateService } from './verifiable-credential-create.service'
import { VCAccessControlCreateService } from '../../vc-access-control/service/verifiable-credential-access-control-create.service'
import { VCAccessControlUpdateService } from '../../vc-access-control/service/verifiable-credential-access-control-update.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { NotFoundException } from '@nestjs/common'
import { CreateVCRequestBodyDto } from '../dto/create-vc-request-body.dto'
import { PushVCRequestBodyDto } from '../dto/push-vc-request-body.dto'
import { VcType } from '../../common/constants/enums'
import { AppModule } from '../../app.module'
import { RedisModule } from '../../redis/module/redis.module'
import { ConfigService } from 'aws-sdk'
import { FilesReadService } from '../../files/service/files-read.service'
import { FilesUpdateService } from '../../files/service/files-update.service'
import { S3StorageService } from '../../files/service/s3-storage.service'
import { RedisService } from '../../redis/service/redis.service'
import { VCAccessControlReadService } from '../../vc-access-control/service/verifiable-credential-access-control-read.service'
import { ShareRequestDeleteService } from './share-request-delete.service'
import { ShareRequestReadService } from './share-request-read.service'
import { VerifiableCredentialReadService } from './verifiable-credential-read.service'
import { GrafanaLoggerService } from '../../grafana/service/grafana.service'

describe('VerifiableCredentialCreateService', () => {
  let service: VerifiableCredentialCreateService
  let vcAclCreateService: VCAccessControlCreateService
  let vcAclUpdateService: VCAccessControlUpdateService
  let walletReadService: WalletReadService
  let vcModel: any

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule, AppModule],
      providers: [
        GrafanaLoggerService,
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

    service = module.get<VerifiableCredentialCreateService>(VerifiableCredentialCreateService)
    vcAclCreateService = module.get<VCAccessControlCreateService>(VCAccessControlCreateService)
    vcAclUpdateService = module.get<VCAccessControlUpdateService>(VCAccessControlUpdateService)
    walletReadService = module.get<WalletReadService>(WalletReadService)
    vcModel = module.get(getModelToken('VerifiableCredential'))
  })

  describe('createVerifiableCredential', () => {
    it('should create a verifiable credential', async () => {
      const vcRequest: CreateVCRequestBodyDto = {
        did: 'test_did',
        fileId: 'test_fileId',
        walletId: 'test_walletId',
        type: VcType.RECEIVED,
        category: 'test_category',
        templateId: 'test_templateId',
        tags: ['tag1', 'tag2'],
        name: 'test_vc',
      }

      const walletDetails = { data: { _id: vcRequest.walletId } }
      jest.spyOn(service['walletReadService'], 'getWalletDetails').mockResolvedValue(walletDetails)

      const vcAclDetails = { restrictedKey: 'test_restrictedKey', restrictedUrl: 'test_restrictedUrl' }
      jest.spyOn(vcAclCreateService, 'createVcAccessControl').mockResolvedValue(vcAclDetails)
      jest
        .spyOn(service['vcAclUpdateService'], 'updateVcIdByRestrictedKey')
        .mockReturnValue({ restrictedKey: 'test_restrictedKey' } as any)
      const createdVc = { _id: 'test_vcId' }
      jest.spyOn(service['vcModel'], 'create').mockReturnValue(createdVc as any)

      const result = await service.createVerifiableCredential(vcRequest)

      expect(result).toEqual(expect.objectContaining({ data: createdVc }))
    })

    it('should throw NotFoundException if wallet is not found', async () => {
      const vcRequest: CreateVCRequestBodyDto = {
        did: 'test_did',
        fileId: 'test_fileId',
        walletId: 'invalid_walletId',
        type: VcType.RECEIVED,
        category: 'test_category',
        templateId: 'test_templateId',
        tags: ['tag1', 'tag2'],
        name: 'test_vc',
      }

      jest.spyOn(walletReadService, 'getWalletDetails').mockResolvedValue({ data: null })

      await expect(service.createVerifiableCredential(vcRequest)).rejects.toThrowError(NotFoundException)
    })

    // Add more test cases to cover other scenarios
  })

  describe('pushVerifiableCredential', () => {
    it('should push a verifiable credential', async () => {
      const vcRequest: PushVCRequestBodyDto = {
        did: 'test_did',
        walletId: 'test_walletId',
        type: VcType.RECEIVED,
        category: 'test_category',
        vcIconUrl: 'test_vcIconUrl',
        templateId: 'test_templateId',
        tags: ['tag1', 'tag2'],
        name: 'test_vc',
      }

      const walletDetails = { data: { _id: vcRequest.walletId } }
      jest.spyOn(service['walletReadService'], 'getWalletDetails').mockResolvedValue(walletDetails)

      const vcAclDetails = { restrictedKey: 'test_restrictedKey', restrictedUrl: 'test_restrictedUrl' }
      jest.spyOn(vcAclCreateService, 'createVcAccessControl').mockResolvedValue(vcAclDetails)

      const createdVc = { _id: 'test_vcId' }
      jest.spyOn(vcModel, 'create').mockReturnValue(createdVc)
      jest
        .spyOn(service['vcAclUpdateService'], 'updateVcIdByRestrictedKey')
        .mockReturnValue({ restrictedKey: 'test_restrictedKey' } as any)

      const result = await service.pushVerifiableCredential(vcRequest)

      expect(result).toEqual(expect.objectContaining({ data: createdVc }))
    })

    it('should throw NotFoundException if wallet is not found', async () => {
      const vcRequest: PushVCRequestBodyDto = {
        did: 'test_did',
        walletId: 'invalid_walletId',
        type: VcType.RECEIVED,
        category: 'test_category',
        vcIconUrl: 'test_vcIconUrl',
        templateId: 'test_templateId',
        tags: ['tag1', 'tag2'],
        name: 'test_vc',
      }

      jest.spyOn(walletReadService, 'getWalletDetails').mockResolvedValue({ data: null })

      await expect(service.pushVerifiableCredential(vcRequest)).rejects.toThrowError(NotFoundException)
    })
  })
})
