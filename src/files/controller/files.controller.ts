import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import 'multer'
import { CREATE_FILE_API } from 'src/common/constants/api-documentation'
import { FilesErrors, WalletErrors } from 'src/common/constants/error-messages'
import { WalletReadService } from 'src/wallet/service/wallet-read.service'
import { CreateFileRequestDto } from '../dto/create-file-request.dto'
import { StandardWalletRequestDto } from '../dto/standard-wallet-request.dto'
import { FileEntity } from '../entities/file.entity'
import { FilesCreateService } from '../service/files-create.service'
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
  @UseInterceptors(FileInterceptor('file'))
  async createFile(@UploadedFile() file: Express.Multer.File, @Body() body: CreateFileRequestDto) {
    if (file == null) {
      throw new BadRequestException(FilesErrors.FILE_MISSING_ERROR)
    }

    const walletDetails = await this.walletService.getWalletDetails(new StandardWalletRequestDto(null, body.walletId))
    if (walletDetails['userId'] == null) {
      throw new Error(WalletErrors.WALLET_NOT_FOUND)
    }

    const fileResult = this.fileCreateService.createFile(file, body)
    return fileResult
  }
}
