import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { CreateFileRequestDto } from '../dto/create-file-request.dto'
import { FileEntity } from '../entities/file.entity'
import { FilesCreateService } from '../service/files-create.service'
import { FilesController } from './files.controller'
import { WalletErrors } from '../..//common/constants/error-messages'
import { File } from '../schemas/files.schema'
import { Model } from 'mongoose'
import { ApiClient } from '../../common/api-client'
import { VerifiableCredentialCreateService } from '../../verifiable-credential/service/verifiable-credential-create.service'
import { S3StorageService } from '../service/s3-storage.service'
import { ConfigService } from '@nestjs/config'

describe('FilesController', () => {
  let controller: FilesController
  let fileCreateService: FilesCreateService
  let walletReadService: WalletReadService
  let fileModelMock: Model<File>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesCreateService,
          useValue: {
            createFile: jest.fn().mockResolvedValue({} as any),
          },
        },
        {
          provide: WalletReadService,
          useValue: {
            getWalletDetails: jest.fn().mockResolvedValue({ userId: 'user123' }),
          },
        },
      ],
    }).compile()

    controller = module.get<FilesController>(FilesController)
    fileCreateService = module.get<FilesCreateService>(FilesCreateService)
    walletReadService = module.get<WalletReadService>(WalletReadService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('createFile', () => {
    it('should create a file', async () => {
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('test data'),
        destination: '',
        filename: 'test.txt',
        path: '',
        stream: null,
      }

      const body: CreateFileRequestDto = {
        walletId: 'wallet_ec3a32c5-b7fa-417c-8537-41c8f915258a',
        category: 'Result',
        tags: ['Result', 'cbse'],
        name: 'Result',
      }

      const result = await controller.createFile(file, body)
      expect(result).toBeDefined()
      expect(fileCreateService.createFile).toHaveBeenCalledWith(file, body)
    })

    it('should throw BadRequestException if file is missing', async () => {
      const body: CreateFileRequestDto = {
        walletId: 'wallet123',
        category: 'Result',
        tags: ['Result', 'cbse'],
        name: 'Result',
      }

      await expect(controller.createFile(undefined, body)).rejects.toThrow(BadRequestException)
    })

    it('should throw Error if wallet details are not found', async () => {
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('test data'),
        destination: '',
        filename: 'test.txt',
        path: '',
        stream: null,
      }

      const body: CreateFileRequestDto = {
        walletId: null,
        category: 'Result',
        tags: ['Result', 'cbse'],
        name: 'Result',
      }

      jest
        .spyOn(walletReadService, 'getWalletDetails')
        .mockRejectedValue(new NotFoundException(WalletErrors.WALLET_NOT_FOUND))

      await expect(controller.createFile(file, body)).rejects.toThrow(
        new NotFoundException(WalletErrors.WALLET_NOT_FOUND),
      )
    })
  })
})
