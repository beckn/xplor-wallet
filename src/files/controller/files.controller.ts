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
<<<<<<< HEAD
import { FileAction } from 'src/common/constants/enums'
import { FilesErrors, WalletErrors } from 'src/common/constants/error-messages'
import { WalletService } from 'src/wallet/service/wallet.service'
import { CreateFileRequestDto } from '../dto/create-file-request.dto'
import { CreateFileDto } from '../dto/create-file.dto'
import { DeleteFileRequestDto } from '../dto/delete-file-request.dto'
=======
import { multerFileUploadConfig } from 'src/config/multer-file.config'
import { WalletService } from 'src/wallet/service/wallet.service'
import { CreateFileRequestDto } from '../dto/create-file-request.dto'
import { CreateFileDto } from '../dto/create-file.dto'
>>>>>>> develop
import { GetFileByFileIdDto } from '../dto/get-file-by-id.dto'
import { GetFilesRequestDto } from '../dto/get-files-request.dto'
import { GetShareFileRequestsDto } from '../dto/get-share-file-request-list.dto'
import { MetadataFiltersRequestDto } from '../dto/metadata-filter-request.dto'
import { RequestShareFileRequestDto } from '../dto/request-share-file-request.dto'
import { ShareFileRequestDto } from '../dto/share-file-request.dto'
<<<<<<< HEAD
import { StandardFileRequestDto, StandardFileRequestParamsDto } from '../dto/standard-file-request.dto'
import { StandardWalletRequestDto } from '../dto/standard-wallet-request.dto'
import { FileEntity, FilesListEntity } from '../entities/file.entity'
import { ShareRequestEntity, ShareRequestsEntityList } from '../entities/share-request.entity'
=======
import { FileEntity, FilesListEntity } from '../entities/file.entity'
import { ShareRequestEntity, ShareRequestsEntityList } from '../entities/share-request.entity'
import { FileAccessControlService } from '../service/file-access-control.service'
>>>>>>> develop
import { FilesService } from '../service/files.service'

@ApiTags('Files')
@Controller('wallet/files')
export class FilesController {
<<<<<<< HEAD
  constructor(private readonly fileService: FilesService, private readonly walletService: WalletService) {}
=======
  constructor(
    private readonly fileService: FilesService,
    private readonly walletService: WalletService,
    private readonly fileAccessControl: FileAccessControlService,
  ) {}
>>>>>>> develop

  @Post()
  @ApiOperation({ summary: 'Create File', description: 'Creates a new file with the provided data' })
  @ApiResponse({ status: 201, description: 'File created successfully.', type: FileEntity })
  @ApiResponse({ status: 400, description: 'Bad request. Please provide valid input data.' })
<<<<<<< HEAD
  @UseInterceptors(FileInterceptor('file'))
  async createFile(@UploadedFile() file: Express.Multer.File, @Body() body: CreateFileRequestDto) {
    if (file == null) {
      throw new BadRequestException(FilesErrors.FILE_MISSING_ERROR)
=======
  @UseInterceptors(FileInterceptor('file', multerFileUploadConfig))
  async createFile(@UploadedFile() file: Express.Multer.File, @Body() body: CreateFileRequestDto) {
    if (file == null) {
      throw new BadRequestException('Please attach a file document.')
>>>>>>> develop
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

<<<<<<< HEAD
    const walletDetails = await this.walletService.getWalletDetails(new StandardWalletRequestDto(body.userId, null))

    if (walletDetails.data['userId'] == null) {
      throw new Error(WalletErrors.WALLET_NOT_FOUND)
=======
    const walletDetails = await this.walletService.getWalletDetails(body.userId)

    if (walletDetails.data['userId'] == null) {
      throw new Error('No Wallet exists with this user.')
>>>>>>> develop
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
<<<<<<< HEAD
  async getShareRequests(@Query() queries: GetShareFileRequestsDto) {
    const shareRequests = await this.fileService.getShareRequestsList(queries.userId, queries)
=======
  async getShareRequests(@Query('userId') userId: string, @Query() queries: GetShareFileRequestsDto) {
    const shareRequests = await this.fileService.getShareRequestsList(userId, queries)
>>>>>>> develop
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
<<<<<<< HEAD
  async getAllFiles(@Query() queryParams: GetFilesRequestDto) {
    const skip = (queryParams.page - 1) * queryParams.pageSize
    if (queryParams.softDeleted == 'true') {
      return await this.fileService.getSoftDeletedFiles(
        queryParams.userId,
=======
  async getAllFiles(@Query('userId') userId: string, @Query() queryParams: GetFilesRequestDto) {
    const skip = (queryParams.page - 1) * queryParams.pageSize
    let files: any = null
    if (queryParams.softDeleted == 'true') {
      files = await this.fileService.getSoftDeletedFiles(
        userId,
>>>>>>> develop
        queryParams.searchQuery,
        queryParams.fileType,
        queryParams.fileTags,
        skip,
        queryParams.pageSize,
      )
    } else {
<<<<<<< HEAD
      return await this.fileService.getAllFiles(
        queryParams.userId,
=======
      files = await this.fileService.getAllFiles(
        userId,
>>>>>>> develop
        queryParams.searchQuery,
        queryParams.fileType,
        queryParams.fileTags,
        skip,
        queryParams.pageSize,
      )
    }
<<<<<<< HEAD
=======

    return files
>>>>>>> develop
  }

  @Delete()
  @ApiOperation({ summary: 'Delete File', description: 'Deletes a file by its ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully.', type: FileEntity })
  @ApiResponse({ status: 404, description: 'File not found.' })
<<<<<<< HEAD
  async deleteFile(@Query() queryParams: DeleteFileRequestDto) {
    if (queryParams.action == FileAction.DELETE) {
      const result = await this.fileService.softDeleteFile(queryParams.userId, queryParams.fileId)
      return result
    } else if (queryParams.action == FileAction.RECOVER) {
      const result = await this.fileService.recoverFile(queryParams.userId, queryParams.fileId)
=======
  async deleteFile(@Query('userId') userId: string, @Query('fileId') fileId: string, @Query('action') action: string) {
    if (action == 'DELETE') {
      const result = await this.fileService.softDeleteFile(userId, fileId)
      return result
    } else if (action == 'RECOVER') {
      const result = await this.fileService.recoverFile(userId, fileId)
>>>>>>> develop
      return result
    } else {
      throw new NotFoundException('Incorrect action, please enter one of these [DELETE,RECOVER].')
    }
  }

  @Post('/share')
  @ApiOperation({ summary: 'Share File', description: 'Shares a file with another user' })
  @ApiResponse({ status: 200, description: 'File shared successfully.', type: ShareRequestEntity })
<<<<<<< HEAD
  async shareFile(@Query() queryParams: StandardFileRequestDto, @Body() body: ShareFileRequestDto) {
    const shareFile = await this.fileService.shareFile(queryParams.userId, queryParams.fileId, body)
=======
  async shareFile(@Query('userId') userId: string, @Query('fileId') fileId: string, @Body() body: ShareFileRequestDto) {
    const shareFile = await this.fileService.shareFile(userId, fileId, body)
>>>>>>> develop
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
<<<<<<< HEAD
  async deleteShareRequest(@Query() queryParams: StandardFileRequestDto) {
    const shareFile = await this.fileService.deleteShareRequest(queryParams.userId, queryParams.requestId)
=======
  async deleteShareRequest(@Query('userId') userId: string, @Query('requestId') requestId: string) {
    const shareFile = await this.fileService.deleteShareRequest(userId, requestId)
>>>>>>> develop
    return shareFile
  }

  @Patch('/share/requests')
  @ApiOperation({ summary: 'Respond To Share Request', description: 'Responds to a share request' })
  @ApiResponse({ status: 200, description: 'Response sent successfully.', type: ShareRequestEntity })
<<<<<<< HEAD
  async respondToShareRequest(@Query() queryParams: StandardFileRequestParamsDto) {
    const shareFile = await this.fileService.respondToShareRequest(
      queryParams.userId,
      queryParams.requestId,
      queryParams.fileId,
      queryParams.action,
    )
=======
  async respondToShareRequest(
    @Query('userId') userId: string,
    @Query('requestId') requestId: string,
    @Query('attachedFileId') fileId: string,
    @Query('action') action: string,
  ) {
    const shareFile = await this.fileService.respondToShareRequest(userId, requestId, fileId, action)
>>>>>>> develop
    return shareFile
  }
}
