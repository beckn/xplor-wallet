import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { S3StorageService } from './s3-storage.service'
import * as AWS from 'aws-sdk'

describe('S3StorageService', () => {
  let service: S3StorageService
  let configService: ConfigService

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-bucket'),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3StorageService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile()

    service = module.get<S3StorageService>(S3StorageService)
    configService = module.get<ConfigService>(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('deleteFileUrl', () => {
    it('should return false if error occurs during deletion', async () => {
      // Mock config values
      mockConfigService.get.mockReturnValueOnce('test-bucket')

      const mockDeleteObject = jest.fn().mockImplementation(() => {
        throw new Error('Test error')
      })
      AWS.S3.prototype.deleteObject = mockDeleteObject

      const result = await service.deleteFileUrl('test-key')

      expect(result).toBe(false)
    })
  })

  describe('refreshFileUrl', () => {
    it('should return a signed URL for the file', async () => {
      // Mock config values
      mockConfigService.get.mockReturnValueOnce('test-bucket')

      const mockGetSignedUrlPromise = jest.fn().mockResolvedValue('signed-url')
      AWS.S3.prototype.getSignedUrlPromise = mockGetSignedUrlPromise

      const result = await service.refreshFileUrl('test-key')

      expect(result).toBe('signed-url')
      expect(mockGetSignedUrlPromise).toHaveBeenCalledWith('getObject', {
        Bucket: 'test-bucket',
        Key: 'test-key',
        Expires: 601200, // Assuming MaxVCShareHours is 1 hour
      })
    })

    it('should throw an error if unable to generate signed URL', async () => {
      // Mock config values
      mockConfigService.get.mockReturnValueOnce('test-bucket')

      const mockGetSignedUrlPromise = jest.fn().mockRejectedValue(new Error('Test error'))
      AWS.S3.prototype.getSignedUrlPromise = mockGetSignedUrlPromise

      await expect(service.refreshFileUrl('test-key')).rejects.toThrowError('Test error')
      expect(mockGetSignedUrlPromise).toHaveBeenCalledWith('getObject', {
        Bucket: 'test-bucket',
        Key: 'test-key',
        Expires: 601200, // Assuming MaxVCShareHours is 1 hour
      })
    })
  })

  describe('getSignedFileUrl', () => {
    it('should return a signed URL for the file', async () => {
      // Mock config values
      mockConfigService.get.mockReturnValueOnce('test-bucket')

      const mockGetSignedUrlPromise = jest.fn().mockResolvedValue('signed-url')
      AWS.S3.prototype.getSignedUrlPromise = mockGetSignedUrlPromise

      const result = await service.getSignedFileUrl(2, 'test-key') // 2 hours expiration

      expect(result).toBe('signed-url')
      expect(mockGetSignedUrlPromise).toHaveBeenCalledWith('getObject', {
        Bucket: 'test-bucket',
        Key: 'test-key',
        Expires: 7200, // 2 hours in seconds
      })
    })

    it('should throw an error if unable to generate signed URL', async () => {
      // Mock config values
      mockConfigService.get.mockReturnValueOnce('test-bucket')

      const mockGetSignedUrlPromise = jest.fn().mockRejectedValue(new Error('Test error'))
      AWS.S3.prototype.getSignedUrlPromise = mockGetSignedUrlPromise

      await expect(service.getSignedFileUrl(2, 'test-key')).rejects.toThrowError('Test error')
      expect(mockGetSignedUrlPromise).toHaveBeenCalledWith('getObject', {
        Bucket: 'test-bucket',
        Key: 'test-key',
        Expires: 7200, // 2 hours in seconds
      })
    })
  })
})
