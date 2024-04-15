import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { CreateFileRequestDto } from '../dto/create-file-request.dto'
import { FileEntity } from '../entities/file.entity'
import { FilesCreateService } from '../service/files-create.service'
import { FilesController } from './files.controller'

describe('FilesController', () => {
  let controller: FilesController
  let fileCreateService: FilesCreateService
  let walletReadService: WalletReadService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesCreateService,
          useValue: {
            createFile: jest.fn().mockResolvedValue({} as FileEntity),
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
        walletId: 'wallet123',
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
        walletId: 'wallet123',
        category: 'Result',
        tags: ['Result', 'cbse'],
        name: 'Result',
      }

      jest.spyOn(walletReadService, 'getWalletDetails').mockResolvedValue({})

      await expect(controller.createFile(file, body)).rejects.toThrow(Error)
    })
  })
})
