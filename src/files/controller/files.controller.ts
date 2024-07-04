import {
  BadRequestException,
  Body,
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import * as multer from 'multer'
import { CREATE_FILE_API } from '../../common/constants/api-documentation'
import { FilesErrors, InternalMessages } from '../../common/constants/error-messages'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { CreateFileRequestDto } from '../dto/create-file-request.dto'
import { StandardWalletRequestDto } from '../dto/standard-wallet-request.dto'
import { FileEntity } from '../entities/file.entity'
import { FilesCreateService } from '../service/files-create.service'
import { CreateFileWithUrlRequestDto } from '../dto/create-file-url-request.dto'
@ApiTags('Files')
@Controller('wallet/files')
export class FilesController {
  constructor(
    private readonly fileCreateService: FilesCreateService,
    private readonly walletService: WalletReadService,
  ) {}

  /**
   * Creates a new file with the provided data.
   * @param file The uploaded file.
   * @param body The request body containing file data.
   * @returns The created file entity.
   */
  @Post()
  @ApiOperation({
    summary: CREATE_FILE_API.summary,
    description: CREATE_FILE_API.description,
  })
  @ApiResponse({
    status: CREATE_FILE_API.successResponseCode,
    description: CREATE_FILE_API.successResponseMessage,
    type: FileEntity,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|doc|docx|octet-stream)$/)) {
          return cb(new BadRequestException(InternalMessages.UPLOAD_FILE_TYPE), false)
        }

        cb(null, true)
      },
    }),
  )
  async createFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024, message: InternalMessages.UPLOAD_FILE_SIZE }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: CreateFileRequestDto,
  ) {
    if (file == null) {
      throw new BadRequestException(FilesErrors.FILE_MISSING_ERROR)
    }

    await this.walletService.getWalletDetails(new StandardWalletRequestDto(null, body.walletId))

    return this.fileCreateService.createFile(file, body)
  }

  @Post('/certificate')
  async createFileWithUrl(@Body() body: CreateFileWithUrlRequestDto) {
    if (!body.fileUrl) {
      throw new BadRequestException('File Url is required')
    }

    await this.walletService.getWalletDetails(new StandardWalletRequestDto(null, body.walletId))

    return this.fileCreateService.createFile(null, body)
  }
}
