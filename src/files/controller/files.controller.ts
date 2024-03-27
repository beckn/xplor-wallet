import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
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
import 'multer'
import { FileAction } from 'src/common/constants/enums'
import { FilesErrors, WalletErrors } from 'src/common/constants/error-messages'
import { WalletService } from 'src/wallet/service/wallet.service'
import { CreateFileRequestDto } from '../dto/create-file-request.dto'
import { CreateFileDto } from '../dto/create-file.dto'
import { DeleteFileRequestDto } from '../dto/delete-file-request.dto'
import { GetFileByFileIdDto } from '../dto/get-file-by-id.dto'
import { GetFilesRequestDto } from '../dto/get-files-request.dto'
import { GetShareFileRequestsDto } from '../dto/get-share-file-request-list.dto'
import { MetadataFiltersRequestDto } from '../dto/metadata-filter-request.dto'
import { RequestShareFileRequestDto } from '../dto/request-share-file-request.dto'
import { ShareFileRequestDto } from '../dto/share-file-request.dto'
import { StandardFileRequestDto, StandardFileRequestParamsDto } from '../dto/standard-file-request.dto'
import { StandardWalletRequestDto } from '../dto/standard-wallet-request.dto'
import { FileEntity, FilesListEntity } from '../entities/file.entity'
import { ShareRequestEntity, ShareRequestsEntityList } from '../entities/share-request.entity'
import { FilesService } from '../service/files.service'
@ApiTags('Files')
@Controller('wallet/files')
export class FilesController {
  constructor(private readonly fileService: FilesService, private readonly walletService: WalletService) {}

  /**
   * Creates a new file with the provided data.
   * @param file The uploaded file.
   * @param body The request body containing file data.
   * @returns The created file entity.
   */
  @Post()
  @ApiOperation({ summary: 'Create File', description: 'Creates a new file with the provided data' })
  @ApiResponse({ status: 201, description: 'File created successfully.', type: FileEntity })
  @ApiResponse({ status: 400, description: 'Bad request. Please provide valid input data.' })
  @UseInterceptors(FileInterceptor('file'))
  async createFile(@UploadedFile() file: Express.Multer.File, @Body() body: CreateFileRequestDto) {
    if (file == null) {
      throw new BadRequestException(FilesErrors.FILE_MISSING_ERROR)
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
    const walletDetails = await this.walletService.getWalletDetails(new StandardWalletRequestDto(body.userId, null))
    if (walletDetails['userId'] == null) {
      throw new Error(WalletErrors.WALLET_NOT_FOUND)
    }

    const fileResult = this.fileService.createFile(file, fileDto)
    return fileResult
  }

  /**
   * Views the file document with the provided key.
   * @param key The key of the file document to view.
   * @param res The HTTP response object.
   * @returns The file document.
   */
  @Get('/view/:key')
  @ApiOperation({ summary: 'View File Document', description: 'Views the file document with the provided key' })
  @ApiResponse({ status: 200, description: 'File document retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  async viewFileDocument(@Param('key') key: string, @Res() res) {
    const file = await this.fileService.viewFile(key, res)
    return file
  }

  /**
   * Fetches the file data by its ID.
   * @param queryParams The query parameters containing userId and fileId.
   * @returns The file data.
   */
  @Get('file')
  @ApiOperation({ summary: 'Get File By Id', description: 'Fetches the file data by its ID' })
  @ApiResponse({ status: 200, description: 'File data retrieved successfully.', type: FileEntity })
  @ApiResponse({ status: 404, description: 'File not found.' })
  async getFileById(@Query() queryParams: GetFileByFileIdDto) {
    // Call the service method to fetch the file by fileId and userId
    const file = await this.fileService.getFileByFileIdAndUserId(queryParams.userId, queryParams.fileId)
    return file
  }

  /**
   * Fetches the list of share requests for a file.
   * @param queries The query parameters containing the userId.
   * @returns The list of share requests.
   */
  @Get('/share/requests')
  @ApiOperation({ summary: 'Get Share Requests', description: 'Fetches the list of share requests for a file' })
  @ApiResponse({ status: 200, description: 'Share requests retrieved successfully.', type: ShareRequestsEntityList })
  @ApiResponse({ status: 404, description: 'Share requests not found' })
  async getShareRequests(@Query() queries: GetShareFileRequestsDto) {
    const shareRequests = await this.fileService.getShareRequestsList(queries.userId, queries)
    return shareRequests
  }

  /**
   * Searches files based on metadata filters.
   * @param userId The ID of the user.
   * @param body The request body containing metadata filters.
   * @returns The list of files matching the metadata filters.
   */
  @Post('search-metadata')
  @ApiOperation({ summary: 'Search Metadata', description: 'Searches files based on metadata filters' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully.', type: FilesListEntity })
  @ApiResponse({ status: 404, description: 'Files not found' })
  async getFilesWithMetadata(@Query('userId') userId: string, @Body() body: MetadataFiltersRequestDto) {
    const filesResult = await this.fileService.getFilesWithMetadata(userId, body.filters)
    return filesResult
  }

  /**
   * Fetches all files for a user.
   * @param queryParams The query parameters containing user ID, search query, file type, file tags, page number, and page size.
   * @returns The list of files retrieved successfully.
   */
  @Get()
  @ApiOperation({ summary: 'Get All Files', description: 'Fetches all files for a user' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully.', type: FilesListEntity })
  @ApiResponse({ status: 404, description: 'Files not found' })
  async getAllFiles(@Query() queryParams: GetFilesRequestDto) {
    const skip = (queryParams.page - 1) * queryParams.pageSize
    if (queryParams.softDeleted == 'true') {
      return await this.fileService.getSoftDeletedFiles(
        queryParams.userId,
        queryParams.searchQuery,
        queryParams.fileType,
        queryParams.fileTags,
        skip,
        queryParams.pageSize,
      )
    } else {
      return await this.fileService.getAllFiles(
        queryParams.userId,
        queryParams.searchQuery,
        queryParams.fileType,
        queryParams.fileTags,
        skip,
        queryParams.pageSize,
      )
    }
  }

  /**
   * Deletes a file by its ID.
   * @param queryParams The query parameters containing user ID, file ID, and action (DELETE, PERMANENT_DELETE, RECOVER).
   * @returns The deleted file or recovered file if the action is RECOVER.
   * @throws NotFoundException If the action provided is not DELETE or RECOVER.
   */
  @Delete()
  @ApiOperation({ summary: 'Delete File', description: 'Deletes/recovers a file by its ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully.', type: FileEntity })
  @ApiResponse({ status: 404, description: 'File not found.' })
  async softDeleteFile(@Query() queryParams: DeleteFileRequestDto) {
    if (queryParams.action == FileAction.DELETE) {
      const result = await this.fileService.softDeleteFile(queryParams.userId, queryParams.fileId)
      return result
    } else if (queryParams.action == FileAction.PERMANENT_DELETE) {
      const result = await this.fileService.hardDeleteFile(queryParams.userId, queryParams.fileId)
      return result
    } else if (queryParams.action == FileAction.RECOVER) {
      const result = await this.fileService.recoverFile(queryParams.userId, queryParams.fileId)
      return result
    } else {
      throw new BadRequestException(FilesErrors.INVALID_DELETE_ACTION)
    }
  }

  /**
   * Shares a file with another user.
   * @param queryParams The query parameters containing user ID and file ID.
   * @param body The request body containing information about the file to be shared.
   * @returns The share request entity if the file is shared successfully.
   */
  @Post('/share')
  @ApiOperation({ summary: 'Share File', description: 'Shares a file with another user' })
  @ApiResponse({ status: 200, description: 'File shared successfully.', type: ShareRequestEntity })
  async shareFile(@Query() queryParams: StandardFileRequestDto, @Body() body: ShareFileRequestDto) {
    const shareFile = await this.fileService.shareFile(queryParams.userId, queryParams.fileId, body)
    return shareFile
  }

  /**
   * Requests to share a file from another user.
   * @param userId The user ID of the requesting user.
   * @param body The request body containing information about the file to be shared.
   * @returns The share request entity if the request is sent successfully.
   */
  @Post('/share/requests')
  @ApiOperation({ summary: 'Request Share File', description: 'Requests to share a file from another user' })
  @ApiResponse({ status: 200, description: 'Share request sent successfully.', type: ShareRequestEntity })
  async requestShareFile(@Query('userId') userId: string, @Body() body: RequestShareFileRequestDto) {
    const shareFile = await this.fileService.requestShareFile(userId, body)
    return shareFile
  }

  /**
   * Deletes a share request by its ID.
   * @param queryParams The query parameters containing user ID and request ID.
   * @returns The deleted share request entity if successful.
   */
  @Delete('/share/requests')
  @ApiOperation({ summary: 'Delete Share Request', description: 'Deletes a share request by its ID' })
  @ApiResponse({ status: 200, description: 'Share request deleted successfully.', type: ShareRequestEntity })
  async deleteShareRequest(@Query() queryParams: StandardFileRequestDto) {
    const shareFile = await this.fileService.deleteShareRequest(queryParams.userId, queryParams.requestId)
    return shareFile
  }

  /**
   * Responds to a share request.
   * @param queryParams The query parameters containing user ID, request ID, file ID, and action.
   * @returns The updated share request entity if successful.
   */
  @Patch('/share/requests')
  @ApiOperation({ summary: 'Respond To Share Request', description: 'Responds to a share request' })
  @ApiResponse({ status: 200, description: 'Response sent successfully.', type: ShareRequestEntity })
  async respondToShareRequest(@Query() queryParams: StandardFileRequestParamsDto) {
    const shareFile = await this.fileService.respondToShareRequest(
      queryParams.userId,
      queryParams.requestId,
      queryParams.fileId,
      queryParams.action,
    )
    return shareFile
  }
}
