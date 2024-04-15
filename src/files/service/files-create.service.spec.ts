import { ConfigService } from '@nestjs/config'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { Model } from 'mongoose'
import { ApiClient } from '../../common/api-client'
import { VerifiableCredentialCreateService } from '../../verifiable-credential/service/verifiable-credential-create.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { FilesCreateService } from './files-create.service'
import { S3StorageService } from './s3-storage.service'

describe('FilesCreateService', () => {
  let service: FilesCreateService
  let vcCreateService: VerifiableCredentialCreateService
  let walletReadService: WalletReadService
  let apiClient: ApiClient
  let storageService: S3StorageService
  let fileModel: Model<any>
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesCreateService,
        VerifiableCredentialCreateService,
        WalletReadService,
        ApiClient,
        S3StorageService,
        ConfigService,
        {
          provide: getModelToken('File'),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            prototype: {},
            findOne: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<FilesCreateService>(FilesCreateService)
    vcCreateService = module.get<VerifiableCredentialCreateService>(VerifiableCredentialCreateService)
    walletReadService = module.get<WalletReadService>(WalletReadService)
    apiClient = module.get<ApiClient>(ApiClient)
    storageService = module.get<S3StorageService>(S3StorageService)
    fileModel = module.get<Model<any>>(getModelToken('File'))
    configService = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // describe('createFile', () => {
  //   it('should create a file and verifiable credential', async () => {
  //     // Mock dependencies
  //     const file = {
  //       mimetype: 'image/jpeg',
  //     }
  //     const storeFileDetails = {
  //       signedUrl: 'http://example.com',
  //       uploadedFile: {
  //         key: 'example_key',
  //       },
  //     }
  //     jest.spyOn(storageService, 'uploadFile').mockResolvedValue(storeFileDetails)

  //     const walletDetails = {
  //       walletId: 'walletId123',
  //     }
  //     jest.spyOn(walletReadService, 'findWalletByWalletId').mockResolvedValue(walletDetails)

  //     const vcResult = {
  //       credential: {
  //         id: 'credential_id',
  //       },
  //     }
  //     jest.spyOn(apiClient, 'post').mockResolvedValue(vcResult)

  //     const createVcRequest = new CreateVCRequestBodyDto(
  //       vcResult.credential.id,
  //       'file_id',
  //       'wallet_id',
  //       VcType.SELF_ISSUED,
  //       'category',
  //       null,
  //       ['tag1', 'tag2'],
  //       'name-timestamp',
  //     )
  //     jest.spyOn(vcCreateService, 'createVerifiableCredential').mockResolvedValue({})

  //     const result = await service.createFile(file as any, {} as CreateFileRequestDto)

  //     // Assert
  //     expect(result).toBeDefined()
  //     // Add more assertions as needed
  //   })

  //   it('should throw BadRequestException if file upload fails', async () => {
  //     // Mock file upload failure
  //     jest.spyOn(storageService, 'uploadFile').mockRejectedValue(new Error('Upload failed'))

  //     // Execute the method
  //     await expect(service.createFile({} as any, {} as CreateFileRequestDto)).rejects.toThrowError(BadRequestException)
  //   })
  // })
})
