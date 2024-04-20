import { NotFoundException, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Model } from 'mongoose'
import { FilesCreateService } from './files-create.service'
import { VerifiableCredentialCreateService } from '../../verifiable-credential/service/verifiable-credential-create.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { ApiClient } from '../../common/api-client'
import { S3StorageService } from './s3-storage.service'
import { CreateFileRequestDto } from '../dto/create-file-request.dto'
import { Test, TestingModule } from '@nestjs/testing'
import { getSuccessResponse } from '../../utils/get-success-response'
import { HttpResponseMessage } from '../../common/constants/http-response-message'

describe('FilesCreateService', () => {
  let filesCreateService: FilesCreateService
  const fileModelMock: Model<any> = jest.fn() as any
  let vcCreateServiceMock: VerifiableCredentialCreateService
  let walletReadServiceMock: WalletReadService
  let apiClientMock: ApiClient
  let storageServiceMock: S3StorageService
  let configServiceMock: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FilesCreateService,
          useValue: {
            createFile: jest.fn(),
          },
        },
        {
          provide: WalletReadService,
          useValue: {
            getWalletDetails: jest.fn(),
          },
        },
        {
          provide: VerifiableCredentialCreateService,
          useValue: {
            createVerifiableCredential: jest.fn(),
          },
        },
        {
          provide: ApiClient,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: S3StorageService,
          useValue: {
            uploadFile: jest.fn().mockResolvedValue({ signedUrl: 'https://', uploadedFile: { key: 'key' } }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile()

    filesCreateService = module.get<FilesCreateService>(FilesCreateService)
    walletReadServiceMock = module.get<WalletReadService>(WalletReadService)
    vcCreateServiceMock = module.get<VerifiableCredentialCreateService>(VerifiableCredentialCreateService)
    apiClientMock = module.get<ApiClient>(ApiClient)
    storageServiceMock = module.get<S3StorageService>(S3StorageService)
    configServiceMock = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(filesCreateService).toBeDefined()
  })
})
