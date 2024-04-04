import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import 'multer'
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
    summary: 'Create/Upload File to wallet',
    description:
      'Creates/Uploads a new file with the provided data and stores it in user wallet. On creating a file, it generates a File Access Control to access/render the actual file document and it refereshes itself after 7 days on expiration.',
  })
  @ApiResponse({ status: 201, description: 'File created successfully.', type: FileEntity })
  @ApiResponse({ status: 400, description: 'Bad request. Please provide valid input data.' })
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
