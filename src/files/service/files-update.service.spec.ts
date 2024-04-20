import { Test, TestingModule } from '@nestjs/testing'
import { FilesUpdateService } from './files-update.service'
import { S3StorageService } from './s3-storage.service'
import { getModelToken } from '@nestjs/mongoose'
import { NotFoundException } from '@nestjs/common'

// Mock the File model
const mockFileModel = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
}

// Mock the S3StorageService
const mockStorageService = {
  refreshFileUrl: jest.fn(),
}

describe('FilesUpdateService', () => {
  let service: FilesUpdateService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesUpdateService,
        { provide: getModelToken('File'), useValue: mockFileModel },
        { provide: S3StorageService, useValue: mockStorageService },
      ],
    }).compile()

    service = module.get<FilesUpdateService>(FilesUpdateService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should refresh file URL', async () => {
    const fileId = 'fileId'
    const fileKey = 'fileKey'
    const newFileUrl = 'newFileUrl'
    const fileDetails = { _id: fileId, fileKey }

    mockFileModel.findOne.mockResolvedValueOnce(fileDetails)
    mockStorageService.refreshFileUrl.mockReturnValueOnce(newFileUrl)
    mockFileModel.findOneAndUpdate.mockResolvedValueOnce(fileDetails)

    await expect(service.refreshFileUrl(fileId)).resolves.toEqual(newFileUrl)
    expect(mockFileModel.findOne).toHaveBeenCalledWith({ _id: fileId })
    expect(mockStorageService.refreshFileUrl).toHaveBeenCalledWith(fileKey)
    expect(mockFileModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: fileId },
      { storedUrl: newFileUrl },
      { new: true },
    )
  })

  it('should throw NotFoundException if file not found', async () => {
    const fileId = 'nonExistentId'

    mockFileModel.findOne.mockResolvedValueOnce({})

    await expect(service.refreshFileUrl(fileId)).rejects.toThrow(NotFoundException)
    expect(mockFileModel.findOne).toHaveBeenCalledWith({ _id: fileId })
    expect(mockStorageService.refreshFileUrl).not.toHaveBeenCalled()
    expect(mockFileModel.findOneAndUpdate).not.toHaveBeenCalled()
  })
})
