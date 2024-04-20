import { NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { getModelToken } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { ApiClient } from '../../common/api-client'
import { FilesDeleteService } from './files-delete.service'
import { S3StorageService } from './s3-storage.service'

// Mock the File model
const mockFileModel = {
  findOneAndDelete: jest.fn(),
}

const mockApiClient = {}

// Mock the S3StorageService
const mockStorageService = {
  deleteFileUrl: jest.fn(),
}

// Mock the ConfigService
const mockConfigService = {}

describe('FilesDeleteService', () => {
  let service: FilesDeleteService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesDeleteService,
        { provide: getModelToken('File'), useValue: mockFileModel },
        { provide: ApiClient, useValue: mockApiClient },
        { provide: S3StorageService, useValue: mockStorageService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<FilesDeleteService>(FilesDeleteService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('deleteFile', () => {
    it('should delete file by ID', async () => {
      const fileId = 'fileId'
      const deletedFile = { _id: fileId, fileKey: 'fileKey' }

      jest.spyOn(mockFileModel, 'findOneAndDelete').mockResolvedValue(deletedFile)

      await expect(service.deleteFileById(fileId)).resolves.toEqual(deletedFile)
      expect(mockFileModel.findOneAndDelete).toHaveBeenCalledWith({ _id: fileId })
      expect(mockStorageService.deleteFileUrl).toHaveBeenCalledWith(deletedFile.fileKey)
    })

    it('should throw NotFoundException if file not found', async () => {
      const fileId = 'nonExistentId'

      jest.spyOn(mockFileModel, 'findOneAndDelete').mockReturnValue(NotFoundException)

      await expect(service.deleteFileById(fileId)).resolves.toEqual(NotFoundException)
    })
  })
})
