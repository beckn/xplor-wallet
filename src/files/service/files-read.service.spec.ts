import { Test, TestingModule } from '@nestjs/testing'
import { FilesReadService } from './files-read.service'
import { FilesErrors } from '../../common/constants/error-messages'
import { NotFoundException } from '@nestjs/common'
import { VerifiableCredentialCreateService } from '../../verifiable-credential/service/verifiable-credential-create.service'
import { getModelToken } from '@nestjs/mongoose'
import { ConfigService } from 'aws-sdk'
import { ApiClient } from '../../common/api-client'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { S3StorageService } from './s3-storage.service'

// Mock the File model
const mockFileModel = {
  findOne: jest.fn(),
}

describe('FilesReadService', () => {
  let service: FilesReadService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesReadService, { provide: getModelToken('File'), useValue: mockFileModel }],
    }).compile()

    service = module.get<FilesReadService>(FilesReadService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should get file by ID', async () => {
    const fileId = 'fileId'
    const file = { _id: fileId }

    mockFileModel.findOne.mockResolvedValueOnce(file)

    await expect(service.getFileById(fileId)).resolves.toEqual(file)
    expect(mockFileModel.findOne).toHaveBeenCalledWith({ _id: fileId })
  })

  it('should throw NotFoundException if file not found (getFileById)', async () => {
    const fileId = 'nonExistentId'

    mockFileModel.findOne.mockResolvedValueOnce(null)

    await expect(service.getFileById(fileId)).rejects.toThrow(NotFoundException)
    expect(mockFileModel.findOne).toHaveBeenCalledWith({ _id: fileId })
  })

  it('should get file by ID without stored URL', async () => {
    const fileId = 'fileId'
    const file = { _id: fileId }

    mockFileModel.findOne.mockResolvedValueOnce(file)

    await expect(service.getFileByIdWithoutStoredUrl(fileId)).resolves.toEqual(file)
    expect(mockFileModel.findOne).toHaveBeenCalledWith({ _id: fileId }, { storedUrl: 0, fileKey: 0 })
  })

  it('should throw NotFoundException if file not found (getFileByIdWithoutStoredUrl)', async () => {
    const fileId = 'nonExistentId'

    mockFileModel.findOne.mockResolvedValueOnce(null)

    await expect(service.getFileByIdWithoutStoredUrl(fileId)).rejects.toThrow(NotFoundException)
    expect(mockFileModel.findOne).toHaveBeenCalledWith({ _id: fileId }, { storedUrl: 0, fileKey: 0 })
  })
})
