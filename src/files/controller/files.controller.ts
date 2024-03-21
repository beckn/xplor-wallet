import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { multerFileUploadConfig } from 'src/config/multer-file.config'
import { WalletService } from 'src/wallet/service/wallet.service'
import { CreateFileRequestDto } from '../dto/create-file-request.dto'
import { CreateFileDto } from '../dto/create-file.dto'
import { GetFileByFileIdDto } from '../dto/get-file-by-id.dto'
import { GetFilesRequestDto } from '../dto/get-files-request.dto'
import { GetShareFileRequestsDto } from '../dto/get-share-file-request-list.dto'
import { MetadataFiltersRequestDto } from '../dto/metadata-filter-request.dto'
import { RequestShareFileRequestDto } from '../dto/request-share-file-request.dto'
import { ShareFileRequestDto } from '../dto/share-file-request.dto'
import { FileEntity, FilesListEntity } from '../entities/file.entity'
import { ShareRequestEntity, ShareRequestsEntityList } from '../entities/share-request.entity'
import { FileAccessControlService } from '../service/file-access-control.service'
import { FilesService } from '../service/files.service'

@ApiTags('Files')
@Controller('wallet/files')
export class FilesController {
  constructor(
    private readonly fileService: FilesService,
    private readonly walletService: WalletService,
    private readonly fileAccessControl: FileAccessControlService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create File', description: 'Creates a new file with the provided data' })
  @ApiResponse({ status: 201, description: 'File created successfully.', type: FileEntity })
  @ApiResponse({ status: 400, description: 'Bad request. Please provide valid input data.' })
  @UseInterceptors(FileInterceptor('file', multerFileUploadConfig))
  async createFile(@UploadedFile() file: Express.Multer.File, @Body() body: CreateFileRequestDto) {
    if (file == null) {
      throw new BadRequestException('Please attach a file document.')
    }

    const fileDto = new CreateFileDto(
      body.userId,
      body.fileType,
      body.fileTags,
      body.fileName,
      '',
      '',
      false,
      JSON.parse(body.metadata == null ? '{}' : body.metadata),
    )

    const walletDetails = await this.walletService.getWalletDetails(body.userId)

    if (walletDetails.data['userId'] == null) {
      throw new Error('No Wallet exists with this user.')
    }

    const fileResult = this.fileService.createFile(file, fileDto)
    return fileResult
  }

  @Get('/view/:key')
  @ApiOperation({ summary: 'View File Document', description: 'Views the file document with the provided key' })
  @ApiResponse({ status: 200, description: 'File document retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  async viewFileDocument(@Param('key') key: string, @Res() res) {
    const file = await this.fileService.viewFile(key, res)
    return file
  }

  @Get('file')
  @ApiOperation({ summary: 'Get File By Id', description: 'Fetches the file data by its ID' })
  @ApiResponse({ status: 200, description: 'File data retrieved successfully.', type: FileEntity })
  @ApiResponse({ status: 404, description: 'File not found.' })
  async getFileById(@Query() queryParams: GetFileByFileIdDto) {
    // Call the service method to fetch the file by fileId and userId
    const file = await this.fileService.getFileByFileIdAndUserId(queryParams.userId, queryParams.fileId)
    return file
  }

  @Get('/share/requests')
  @ApiOperation({ summary: 'Get Share Requests', description: 'Fetches the list of share requests for a file' })
  @ApiResponse({ status: 200, description: 'Share requests retrieved successfully.', type: ShareRequestsEntityList })
  @ApiResponse({ status: 404, description: 'Share requests not found' })
  async getShareRequests(@Query('userId') userId: string, @Query() queries: GetShareFileRequestsDto) {
    const shareRequests = await this.fileService.getShareRequestsList(userId, queries)
    return shareRequests
  }

  @Post('search-metadata')
  @ApiOperation({ summary: 'Search Metadata', description: 'Searches files based on metadata filters' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully.', type: FilesListEntity })
  @ApiResponse({ status: 404, description: 'Files not found' })
  async getFilesWithMetadata(@Query('userId') userId: string, @Body() body: MetadataFiltersRequestDto) {
    const filesResult = await this.fileService.getFilesWithMetadata(userId, body.filters)
    return filesResult
  }

  @Get()
  @ApiOperation({ summary: 'Get All Files', description: 'Fetches all files for a user' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully.', type: FilesListEntity })
  @ApiResponse({ status: 404, description: 'Files not found' })
  async getAllFiles(@Query('userId') userId: string, @Query() queryParams: GetFilesRequestDto) {
    const skip = (queryParams.page - 1) * queryParams.pageSize
    let files: any = null
    if (queryParams.softDeleted == 'true') {
      files = await this.fileService.getSoftDeletedFiles(
        userId,
        queryParams.searchQuery,
        queryParams.fileType,
        queryParams.fileTags,
        skip,
        queryParams.pageSize,
      )
    } else {
      files = await this.fileService.getAllFiles(
        userId,
        queryParams.searchQuery,
        queryParams.fileType,
        queryParams.fileTags,
        skip,
        queryParams.pageSize,
      )
    }

    return files
  }

  @Delete()
  @ApiOperation({ summary: 'Delete File', description: 'Deletes a file by its ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully.', type: FileEntity })
  @ApiResponse({ status: 404, description: 'File not found.' })
  async deleteFile(@Query('userId') userId: string, @Query('fileId') fileId: string, @Query('action') action: string) {
    if (action == 'DELETE') {
      const result = await this.fileService.softDeleteFile(userId, fileId)
      return result
    } else if (action == 'RECOVER') {
      const result = await this.fileService.recoverFile(userId, fileId)
      return result
    } else {
      throw new NotFoundException('Incorrect action, please enter one of these [DELETE,RECOVER].')
    }
  }

  @Post('/share')
  @ApiOperation({ summary: 'Share File', description: 'Shares a file with another user' })
  @ApiResponse({ status: 200, description: 'File shared successfully.', type: ShareRequestEntity })
  async shareFile(@Query('userId') userId: string, @Query('fileId') fileId: string, @Body() body: ShareFileRequestDto) {
    const shareFile = await this.fileService.shareFile(userId, fileId, body)
    return shareFile
  }

  @Post('/share/requests')
  @ApiOperation({ summary: 'Request Share File', description: 'Requests to share a file from another user' })
  @ApiResponse({ status: 200, description: 'Share request sent successfully.', type: ShareRequestEntity })
  async requestShareFile(@Query('userId') userId: string, @Body() body: RequestShareFileRequestDto) {
    const shareFile = await this.fileService.requestShareFile(userId, body)
    return shareFile
  }

  @Delete('/share/requests')
  @ApiOperation({ summary: 'Delete Share Request', description: 'Deletes a share request by its ID' })
  @ApiResponse({ status: 200, description: 'Share request deleted successfully.', type: ShareRequestEntity })
  async deleteShareRequest(@Query('userId') userId: string, @Query('requestId') requestId: string) {
    const shareFile = await this.fileService.deleteShareRequest(userId, requestId)
    return shareFile
  }

  @Patch('/share/requests')
  @ApiOperation({ summary: 'Respond To Share Request', description: 'Responds to a share request' })
  @ApiResponse({ status: 200, description: 'Response sent successfully.', type: ShareRequestEntity })
  async respondToShareRequest(
    @Query('userId') userId: string,
    @Query('requestId') requestId: string,
    @Query('attachedFileId') fileId: string,
    @Query('action') action: string,
  ) {
    const shareFile = await this.fileService.respondToShareRequest(userId, requestId, fileId, action)
    return shareFile
  }
}
