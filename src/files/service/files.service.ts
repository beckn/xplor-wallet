import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { AxiosRequestConfig } from 'axios'
import * as fs from 'fs'
import { Model } from 'mongoose'
import 'multer'
import * as path from 'path'
import { ApiClient } from 'src/common/api-client'
import { ShareRequestAction } from 'src/common/constants/enums'
import { ErrorCodes } from 'src/common/constants/error-codes'
import { FilesErrors } from 'src/common/constants/error-messages'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { getFutureTimeStamp, matchFilters } from '../../utils/file.utils'
import { CreateFileDto } from '../dto/create-file.dto'
import { CreateShareFileRequestDto, FileShareDetails, Restrictions } from '../dto/create-share-file-request.dto'
import { GetShareFileRequestsDto } from '../dto/get-share-file-request-list.dto'
import { RequestShareFileRequestDto } from '../dto/request-share-file-request.dto'
import { ShareFileRequestDto } from '../dto/share-file-request.dto'
import { File } from '../schemas/files.schema'
import { ShareRequest } from '../schemas/share-request.schema'
import { FileAccessControlService } from './file-access-control.service'
import { S3StorageService } from './s3-storage.service'

@Injectable()
export class FilesService {
  constructor(
    @InjectModel('File') private readonly fileModel: Model<File>,
    @InjectModel('ShareRequest') private readonly shareRequestModel: Model<ShareRequest>,
    private readonly accessService: FileAccessControlService,
    private readonly apiClient: ApiClient,
    private readonly s3Service: S3StorageService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Finds and updates ACL using restrictedKey
   */
  private async updateAccessControl(expiresIn, restrictedKey, fileKey) {
    // Generating Aws signed file url
    const signedFileUrl = await this.s3Service.getSignedFileUrl(expiresIn, fileKey)

    const updatedAcl = await this.accessService.updateRestrictionsByRestrictionKey(
      restrictedKey,
      signedFileUrl,
      getFutureTimeStamp(expiresIn),
    )

    return updatedAcl
  }

  /**
   * Stores the file in AWS S3 Bucket
   * Signs the stored file and generates an ACL for it for 7 Days (Max)
   * Creates a file document and stores in the database
   */
  async createFile(
    file: Express.Multer.File | any,
    createFileDto: CreateFileDto,
  ): Promise<StandardMessageResponse | any> {
    // Store the file in S3 Bucket.
    const uploadFile = await this.s3Service.uploadFile(file)
    // Expiry hours when the restraicted Url & File Signed Url will expire
    const expiresIn = 144

    // By Default -1 means unlimited view Hits
    const allowedViewCount = -1
    console.log(uploadFile)
    // Generating Aws signed file url
    const signedFileUrl = await this.s3Service.getSignedFileUrl(expiresIn, uploadFile.Key)
    const restrictedFile = await this.accessService.createFileAccessControl(
      'fileId', // Need to update this once the fileId is made,
      '',
      signedFileUrl,
      getFutureTimeStamp(expiresIn),
      allowedViewCount,
    )
    if (restrictedFile == null) {
      throw new InternalServerErrorException(FilesErrors.ACL_GENERATION_ERROR)
    }

    const newFileDto = createFileDto
    newFileDto.fileKey = uploadFile.Key
    newFileDto.fileUrl = restrictedFile.restrictedUrl
    const createdFile = new this.fileModel(newFileDto)

    // File created successfully
    const fileResult = await createdFile.save()

    // Updating the file Access control with the newly made fileId
    const fileUpdated = await this.accessService.updateFileIdByRestrictedKey(
      restrictedFile.restrictedKey,
      fileResult._id.toString(),
    )
    return fileResult
  }

  /**
   * Returns all files by applying the given filters for finding files
   */
  async getAllFiles(
    userId: string,
    searchQuery: string,
    fileType: string,
    fileTags: string[],
    skip: number = 0,
    pageSize: number = 20,
  ): Promise<StandardMessageResponse | any> {
    // Construct the query based on the provided parameters
    const query: any = { userId, softDeleted: false }

    if (fileType) {
      query.fileType = fileType
    }

    if (fileTags && fileTags.length > 0) {
      query.fileTags = { $in: fileTags }
    }

    // Add the search query condition to the query
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i') // Case-insensitive regex pattern
      query.$or = [
        { fileName: { $regex: regex } },
        { fileType: { $regex: regex } },
        // Add more fields if needed
      ]
    }

    // Execute the query with pagination using the Mongoose model
    const filesResult = await this.fileModel.find(query).skip(skip).limit(pageSize).select({ fileKey: 0 })

    if (filesResult.length < 1) {
      throw new NotFoundException(FilesErrors.FILES_NOT_FOUND)
    }

    return filesResult
  }

  /**
   * Returns all the Soft Deleted files (softDeleted: true) along with the filters to find file
   */
  async getSoftDeletedFiles(
    userId: string,
    searchQuery: string,
    fileType: string,
    fileTags: string[],
    skip: number = 0,
    pageSize: number = 20,
  ): Promise<StandardMessageResponse | any> {
    // Construct the query based on the provided parameters
    const query: any = { userId, softDeleted: true }

    if (fileType) {
      query.fileType = fileType
    }

    if (fileTags && fileTags.length > 0) {
      query.fileTags = { $in: fileTags }
    }

    // Add the search query condition to the query
    if (searchQuery) {
      const regex = new RegExp(searchQuery, 'i') // Case-insensitive regex pattern
      query.$or = [
        { fileName: { $regex: regex } },
        { fileType: { $regex: regex } },
        // Add more fields if needed
      ]
    }

    // Execute the query with pagination using the Mongoose model
    const filesResult = await this.fileModel.find(query).skip(skip).limit(pageSize).select({ fileKey: 0 })

    if (filesResult.length < 1) {
      throw new NotFoundException(FilesErrors.FILES_NOT_FOUND)
    }

    return filesResult
  }

  /**
   * Returns the file by the FileId and UserId
   */
  async getFileByFileIdAndUserId(userId: string, fileId: string): Promise<StandardMessageResponse | any> {
    // Get the File details by the fileId and userId
    const fileResult = await this.fileModel.findOne({ _id: fileId, userId }).exec()

    if (fileResult == null) {
      throw new NotFoundException(FilesErrors.FILE_NOT_EXIST)
    }

    return fileResult
  }

  /**
   * Returns the file by the FileId
   */
  async getFileByFileId(fileId: string): Promise<StandardMessageResponse | any> {
    // Get the File details by the fileId and userId
    const fileResult = await this.fileModel.findOne({ _id: fileId }).exec()

    if (fileResult == null) {
      throw new NotFoundException(FilesErrors.FILE_NOT_EXIST)
    }

    return fileResult
  }

  /**
   * Returns the file by the FileId, hides fileKey and fileUrl
   */
  async getFilePublicDetailsByFileId(fileId: string): Promise<StandardMessageResponse | any> {
    // Get the File details by the fileId and userId
    const fileResult = await this.fileModel.findOne({ _id: fileId }).select({ fileKey: 0, fileUrl: 0 }).exec()

    if (fileResult == null) {
      throw new NotFoundException(FilesErrors.FILE_NOT_EXIST)
    }

    return fileResult
  }

  /**
   * Returns the files with the matching metadata object filters
   */
  async getFilesWithMetadata(userId, metadata: object): Promise<StandardMessageResponse | any> {
    // Execute the query to get all the files
    const unfilteredFiles = await this.fileModel.find({ userId }).select({ fileKey: 0 }).exec()

    if (unfilteredFiles.length < 1) {
      throw new NotFoundException(FilesErrors.FILES_NOT_FOUND)
    }

    // Filter files based on the metadata
    const filteredFiles = unfilteredFiles.filter((file) => matchFilters(file.metadata, metadata))

    return filteredFiles
  }

  /**
   * Temporary deletes a file
   */
  async softDeleteFile(userId, fileId: string): Promise<StandardMessageResponse | any> {
    const fileDetails = await this.getFileByFileIdAndUserId(userId, fileId)

    if (fileDetails != null) {
      if (fileDetails['userId'] != userId) {
        throw new UnauthorizedException(FilesErrors.DELETE_PERMISSION_ERROR)
      }
    }

    const result = await this.fileModel.findByIdAndUpdate(
      fileId,
      { softDeleted: true },
      { new: true, runValidators: true },
    )
    if (result) {
      return result
    }
  }

  /**
   * Recovers the temporarily deleted file
   */
  async recoverFile(userId, fileId: string): Promise<StandardMessageResponse | any> {
    const fileDetails = await this.getFileByFileIdAndUserId(userId, fileId)

    if (fileDetails != null) {
      if (fileDetails['userId'] != userId) {
        throw new UnauthorizedException(FilesErrors.RECOVER_PERMISSION_ERROR)
      }
    }

    const result = await this.fileModel.findByIdAndUpdate(
      fileId,
      { softDeleted: false },
      { new: true, runValidators: true },
    )
    if (result) {
      return result
    } else {
      throw new InternalServerErrorException(FilesErrors.INTERNAL_ERROR)
    }
  }

  /**
   * Returns the File document in pdf, image or any mulitpart format
   */
  async viewFile(restrictionKey: string, res): Promise<any> {
    // Fetch Access control details by restrictedKey

    const aclDetails = await this.accessService.findByRestrictedKey(restrictionKey)
    const fileDetails = await this.getFileByFileId(aclDetails['fileId'])

    const currentTimestamp = Date.now()

    if (fileDetails['softDeleted'] == true) {
      throw new ForbiddenException(FilesErrors.FILE_DELETED_ERROR)
    }

    // Checking whether the allowedViewCount reached limit for the shareRequest
    if (aclDetails['allowedViewCount'] == 0 && aclDetails['shareRequestId']) {
      throw new UnauthorizedException(FilesErrors.FILES_MAX_COUNT_ERROR)
    } else if (aclDetails['allowedViewCount'] > 0 && aclDetails['shareRequestId']) {
      // Decrease View Count of Access Control
      await this.accessService.updateViewCountByRestrictedKey(
        aclDetails['restrictedKey'],
        aclDetails['allowedViewCount'] - 1,
      )
    }

    if (aclDetails['shareRequestId'] != null && aclDetails['shareRequestId'] != '') {
      const requestDetails = await this.shareRequestModel.findById(aclDetails['shareRequestId'])

      if (requestDetails.status != ShareRequestAction.ACCEPTED) {
        throw new UnauthorizedException(FilesErrors.SHARE_REJECTED_ERROR)
      }
    }

    if (currentTimestamp < aclDetails['expireTimeStamp']) {
      // The expiration timestamp has not yet been reached

      await this.renderFileToResponse(res, aclDetails['fileSignedUrl'], restrictionKey)
    } else {
      // The expiration timestamp has passed

      // Checking if the Access is for a share request
      if (aclDetails['shareRequestId'] != null) {
        if (aclDetails['shareRequestId']) {
          throw new UnauthorizedException(FilesErrors.FILE_EXPIRED_ERROR)
        }

        // Regenerate new accessControl Restriction Details
        const updatedAcl = await this.updateAccessControl(144, restrictionKey, fileDetails['fileKey'])

        // Update the fileUrl inside File to new ACL restrictedUrl
        await this.fileModel
          .findOneAndUpdate(
            { _id: fileDetails['_id'].toString() },
            { fileUrl: updatedAcl['restrictedUrl'] },
            { new: true },
          )
          .exec()

        await this.renderFileToResponse(res, updatedAcl['fileSignedUrl'], updatedAcl['restrictedKey'])
      }
    }
  }

  /**
   * Renders the file from the fileUrl and returns it to Api
   */
  async renderFileToResponse(res, fileUrl, restrictionKey) {
    const headers = {
      Accept: 'application/*',
    }
    const config: AxiosRequestConfig = {
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
      headers: headers,
    }

    const fileDirectory = '/file-uploads/'
    const filePath = path.join(__dirname, '..', fileDirectory)
    const visualResult = await this.apiClient.get(fileUrl, config)

    const fileResponse = await this.apiClient.get(fileUrl, {
      responseType: 'stream',
    })

    const contentType = fileResponse.headers['content-type']
    const fileExtension = contentType.split('/').pop()
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true })
    }

    // Save the file
    const fileName = `${restrictionKey}.${fileExtension}`
    const fullPath = path.join(filePath, fileName)

    // Write PDF data to the file
    fs.writeFileSync(fullPath, visualResult, { encoding: 'binary' })
    if (fs.existsSync(fullPath)) {
      res.set('Content-Type', `application/${fileExtension}`)
      res.download(fullPath, fileName)
      // Clear the file!
      setTimeout(function () {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath)
        }
      }, 3000)
    } else {
      res.status(ErrorCodes.RESOURCE_NOT_FOUND).send(FilesErrors.INTERNAL_ERROR)
    }
  }

  /**
   * Creates a file share record to share with anyone
   * Signs the fileUrl of the AWS File
   * Creates ACL Record for it
   * Updates Acl record with file share request id
   */
  async shareFile(
    userId: string,
    fileId: string,
    shareRequest: ShareFileRequestDto,
  ): Promise<StandardMessageResponse | any> {
    const fileDetails = await this.getFileByFileIdAndUserId(userId, fileId)

    if (fileDetails == null) {
      throw new NotFoundException(FilesErrors.FILE_NOT_EXIST)
    }

    if (fileDetails != null) {
      if (fileDetails['userId'] != userId) {
        throw new UnauthorizedException(FilesErrors.SHARE_PERMISSION_ERROR)
      }

      if (fileDetails['softDeleted'] == true) {
        throw new ForbiddenException(FilesErrors.FILE_DELETED_ERROR)
      }
    }

    const expiryTimeStamp = getFutureTimeStamp(shareRequest.restrictions.expiresIn)

    // Generating Aws signed file url
    const signedFileUrl = await this.s3Service.getSignedFileUrl(
      shareRequest.restrictions.expiresIn,
      fileDetails['fileKey'],
    )
    const restrictedFile = await this.accessService.createFileAccessControl(
      fileId,
      '',
      signedFileUrl,
      getFutureTimeStamp(shareRequest.restrictions.expiresIn),
      shareRequest.restrictions.viewCount,
    )
    if (restrictedFile == null) {
      throw new InternalServerErrorException(FilesErrors.ACL_GENERATION_ERROR)
    }

    const fileShareDetails = new FileShareDetails(
      shareRequest.type,
      shareRequest.documentType,
      new Restrictions(
        expiryTimeStamp,
        shareRequest.restrictions.viewCount,
        shareRequest.restrictions.downloadEnabled,
        shareRequest.restrictions.sharedWithUsers,
      ),
    )
    const createFileShareRequestDto = new CreateShareFileRequestDto(
      fileId,
      ShareRequestAction.ACCEPTED,
      restrictedFile.restrictedUrl,
      userId,
      fileDetails['userId'],
      fileShareDetails,
    )
    const shareRequestModel = new this.shareRequestModel(createFileShareRequestDto)
    const result = await shareRequestModel.save()

    await this.accessService.updateShareRequestIdByRestrictedKey(restrictedFile.restrictedKey, result['_id'].toString())
    if (result) {
      return result
    } else {
      throw new NotFoundException(FilesErrors.FILES_NOT_FOUND)
    }
  }

  /**
   * Requests to share a file of a documentType from given userId
   */
  async requestShareFile(
    userId: string,
    shareRequest: RequestShareFileRequestDto,
  ): Promise<StandardMessageResponse | any> {
    if (shareRequest.restrictions.expiresIn > 168) {
      throw new BadRequestException(FilesErrors.FILE_MAX_TIME_LIMIT_ERROR)
    }

    const fileShareDetails = new FileShareDetails(
      shareRequest.type,
      shareRequest.documentType,
      new Restrictions(
        shareRequest.restrictions.expiresIn,
        shareRequest.restrictions.viewCount,
        shareRequest.restrictions.downloadEnabled,
        shareRequest.restrictions.sharedWithUsers,
      ),
    )

    const createFileShareRequestDto = new CreateShareFileRequestDto(
      'fileId',
      ShareRequestAction.PENDING,
      ' ',
      userId,
      shareRequest.requestedFromUser,
      fileShareDetails,
    )

    const shareRequestModel = new this.shareRequestModel(createFileShareRequestDto)
    const shareRequestResult = await shareRequestModel.save()

    if (shareRequestResult == null) {
      throw new InternalServerErrorException(FilesErrors.INTERNAL_ERROR)
    }

    return shareRequestResult
  }

  /**
   * Deletes File share request
   * Only the request owner (who made the request), can deleted it
   */
  async deleteShareRequest(userId: string, requestId: string): Promise<StandardMessageResponse | any> {
    const requestDetails = await this.shareRequestModel.findById(requestId)

    if (requestDetails == null) {
      throw new NotFoundException(FilesErrors.REQUEST_NOT_FOUND)
    }

    if (requestDetails['raisedByUser'] != userId) {
      throw new UnauthorizedException(FilesErrors.REQUEST_DELETE_PERMISSION_ERROR)
    }

    const result = await this.shareRequestModel.findOneAndDelete({ _id: requestId })

    return result
  }

  /**
   * ACCEPTS, REJECTS the file ShareRequest
   * if ACCEPTED:
   * Signs the AWS File Url and creates an ACL Record for it
   * Stores the ACL RestrictedUrl in ShareRequest's fileUrl
   */
  async respondToShareRequest(
    userId: string,
    requestId: string,
    fileId: string,
    action: ShareRequestAction,
  ): Promise<StandardMessageResponse | any> {
    if (
      action != ShareRequestAction.ACCEPTED &&
      action != ShareRequestAction.REJECTED &&
      action != ShareRequestAction.PENDING
    ) {
      throw new BadRequestException(FilesErrors.INVALID_ACTION)
    }

    const requestDetails = await this.shareRequestModel.findOne({ _id: requestId })

    const fileDetails = await this.fileModel.findOne({ _id: fileId })

    if (requestDetails == null) {
      throw new NotFoundException(FilesErrors.REQUEST_NOT_FOUND)
    }

    if (fileDetails == null) {
      throw new NotFoundException(FilesErrors.FILE_NOT_EXIST)
    }

    if (requestDetails['fileOwnerUser'] != userId) {
      throw new UnauthorizedException(FilesErrors.SHARE_ACTION_PERMISSION_ERROR)
    }

    let actionResult = {}
    if (action == ShareRequestAction.REJECTED) {
      actionResult = await this.shareRequestModel.findOneAndUpdate(
        { _id: requestId },
        {
          status: action,
          fileId: '',
          fileShareUrl: '',
        },
        { new: true },
      )
    } else if (action == ShareRequestAction.ACCEPTED) {
      // Here if the action is ACCEPTED, then set the fileId and generate the restrictedUrl in the shareRequestModel

      // Sign AWS file key
      const signedFileUrl = await this.s3Service.getSignedFileUrl(
        requestDetails['fileShareDetails']['restrictions']['expiresIn'],
        fileDetails['fileKey'],
      )
      // Create an ACL document
      const restrictedFile = await this.accessService.createFileAccessControl(
        fileId,
        requestId,
        signedFileUrl,
        getFutureTimeStamp(requestDetails['fileShareDetails']['restrictions']['expiresIn']),
        requestDetails['fileShareDetails']['restrictions']['viewCount'],
      )

      if (restrictedFile == null) {
        throw new NotFoundException('Failed to respond to the request.')
      }

      // Update the shareRequest with the fileId, status and fileShareUrl

      actionResult = await this.shareRequestModel
        .findOneAndUpdate(
          { _id: requestId },
          {
            status: action,
            fileId: fileId,
            fileShareUrl: restrictedFile['restrictedUrl'],
          },
          { new: true },
        )
        .exec()
    }

    if (actionResult == null) {
      throw new InternalServerErrorException(FilesErrors.INTERNAL_ERROR)
    }

    return actionResult
  }

  /**
   * Returns the list of all the file share requests made by user or received from someone
   */
  async getShareRequestsList(userId: string, queries: GetShareFileRequestsDto): Promise<StandardMessageResponse | any> {
    const filter: any = {
      $or: [{ raisedByUser: userId }, { fileOwnerUser: userId }],
    }

    if (queries.status) {
      filter.$and = [{ status: queries.status }]
    }

    if (queries.documentType) {
      filter.$and = filter.$and || []
      filter.$and.push({ 'fileShareDetails.documentType': queries.documentType })
    }

    const shareRequests = await this.shareRequestModel.find(filter)

    const updatedShareRequests = []

    for (const request of shareRequests) {
      const updatedRequest = { ...request['_doc'] }

      if (request.fileId && request.status === ShareRequestAction.ACCEPTED) {
        const fileDetails = await this.getFilePublicDetailsByFileId(request.fileId)
        if (fileDetails != null) {
          updatedRequest['fileDetails'] = fileDetails
        }
      }

      updatedShareRequests.push(updatedRequest)
    }

    if (updatedShareRequests.length < 1) {
      throw new NotFoundException(FilesErrors.FILES_NOT_FOUND)
    }

    return updatedShareRequests
  }
}
