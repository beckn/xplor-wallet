import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AxiosRequestConfig } from 'axios'
import * as fs from 'fs'
import { Model } from 'mongoose'
import * as path from 'path'
import { ApiClient } from 'src/common/api-client'
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
  ) {}

  private async updateAccessControl(expiresIn, restrictionKey, fileKey) {
    // Generating Aws signed file url
    const signedFileUrl = await this.s3Service.getSignedFileUrl(expiresIn, fileKey)

    const updatedAcl = await this.accessService.updateRestrictionsByRestrictionKey(
      restrictionKey,
      signedFileUrl,
      getFutureTimeStamp(expiresIn),
    )
    console.log(updatedAcl)

    return {
      message: 'Access control restrictions updated successfully!',
      data: updatedAcl,
    }
  }

  async createFile(file: Express.Multer.File | any, createFileDto: CreateFileDto): Promise<StandardMessageResponse> {
    // Store the file in S3 Bucket.
    const uploadFile = await this.s3Service.uploadFile(file)
    console.log(`File uploaded to S3`)
    console.log(uploadFile)
    fs.unlinkSync(file.path)
    // Expiry hours when the restraicted Url & File Signed Url will expire
    const expiresIn = 144

    // By Default -1 means unlimited view Hits
    const allowedViewCount = -1

    // Generating Aws signed file url
    const signedFileUrl = await this.s3Service.getSignedFileUrl(expiresIn, uploadFile.Key)
    const restrictedFile = await this.accessService.createFileAccessControl(
      'fileId', // Need to update this once the fileId is made,
      '',
      signedFileUrl,
      getFutureTimeStamp(expiresIn),
      allowedViewCount,
    )
    console.log('restrictedFile')
    console.log(restrictedFile.data)
    if (restrictedFile.data == null) {
      throw new InternalServerErrorException('There was an error in generating access control for the file. Try again')
    }

    const newFileDto = createFileDto
    newFileDto.fileKey = uploadFile.Key
    newFileDto.fileUrl = restrictedFile.data.restrictedUrl
    const createdFile = new this.fileModel(newFileDto)

    // File created successfully
    const fileResult = await createdFile.save()

    console.log('fileCreated')
    console.log(fileResult)

    // Updating the file Access control with the newly made fileId
    const fileUpdated = await this.accessService.updateFileIdByRestrictedKey(
      restrictedFile.data.restrictedKey,
      fileResult._id.toString(),
    )
    return {
      data: fileResult,
    }
  }

  async getAllFiles(
    userId: string,
    searchQuery: string,
    fileType: string,
    fileTags: string[],
    skip: number = 0,
    pageSize: number = 20,
  ): Promise<StandardMessageResponse> {
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
      throw new NotFoundException('Files not found')
    }

    return {
      data: filesResult,
    }
  }

  async getSoftDeletedFiles(
    userId: string,
    searchQuery: string,
    fileType: string,
    fileTags: string[],
    skip: number = 0,
    pageSize: number = 20,
  ): Promise<StandardMessageResponse> {
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
      throw new NotFoundException('Files not found')
    }

    return {
      data: filesResult,
    }
  }

  async getFileByFileIdAndUserId(userId: string, fileId: string): Promise<StandardMessageResponse> {
    // Get the File details by the fileId and userId
    const fileResult = await this.fileModel.findOne({ _id: fileId, userId }).exec()
    console.log('fileResult')
    console.log(fileResult)

    if (fileResult == null) {
      throw new NotFoundException('File does not exist with the fileId!')
    }

    return {
      data: fileResult,
    }
  }

  async getFileByFileId(fileId: string): Promise<StandardMessageResponse> {
    // Get the File details by the fileId and userId
    const fileResult = await this.fileModel.findOne({ _id: fileId }).exec()
    console.log('fileResult')
    console.log(fileResult)

    if (fileResult == null) {
      throw new NotFoundException('File does not exist with the fileId!')
    }

    return {
      data: fileResult,
    }
  }

  async getFilePublicDetailsByFileId(fileId: string): Promise<StandardMessageResponse> {
    // Get the File details by the fileId and userId
    const fileResult = await this.fileModel.findOne({ _id: fileId }).select({ fileKey: 0, fileUrl: 0 }).exec()

    console.log('fileResult')
    console.log(fileResult)

    if (fileResult == null) {
      throw new NotFoundException('File does not exist with the fileId!')
    }

    return {
      data: fileResult,
    }
  }

  async getFilesWithMetadata(userId, metadata: object): Promise<StandardMessageResponse> {
    // Execute the query to get all the files
    const unfilteredFiles = await this.fileModel.find({ userId }).select({ fileKey: 0 }).exec()

    if (unfilteredFiles.length < 1) {
      throw new NotFoundException('Files not found')
    }

    // Filter files based on the metadata
    const filteredFiles = unfilteredFiles.filter((file) => matchFilters(file.metadata, metadata))

    return {
      data: filteredFiles,
    }
  }

  async softDeleteFile(userId, fileId: string): Promise<StandardMessageResponse> {
    const fileDetails = await this.getFileByFileIdAndUserId(userId, fileId)

    if (fileDetails.data != null) {
      if (fileDetails.data['userId'] != userId) {
        throw new UnauthorizedException("You don't have the permission to delete this file.")
      }
    }

    const result = await this.fileModel.findByIdAndUpdate(
      fileId,
      { softDeleted: true },
      { new: true, runValidators: true },
    )
    if (result) {
      return {
        data: result,
      }
    }
  }

  async recoverFile(userId, fileId: string): Promise<StandardMessageResponse> {
    const fileDetails = await this.getFileByFileIdAndUserId(userId, fileId)

    if (fileDetails.data != null) {
      if (fileDetails.data['userId'] != userId) {
        throw new Error("You don't have the permission to recover this file.")
      }
    }

    const result = await this.fileModel.findByIdAndUpdate(
      fileId,
      { softDeleted: false },
      { new: true, runValidators: true },
    )
    if (result) {
      return {
        data: result,
      }
    } else {
      throw new InternalServerErrorException('There was an error in completing your request.')
    }
  }

  async viewFile(restrictionKey: string, res): Promise<any> {
    // Fetch Access control details by restrictedKey

    const aclDetails = await this.accessService.findByRestrictedKey(restrictionKey)
    console.log(aclDetails.data)
    const fileDetails = await this.getFileByFileId(aclDetails.data['fileId'])

    const currentTimestamp = Date.now()

    console.log(fileDetails.data)
    if (fileDetails.data['softDeleted'] == true) {
      throw new ForbiddenException('You cannot view this file as its deleted, it needs to be recovered first.')
    }

    // Checking whether the allowedViewCount reached limit for the shareRequest
    if (aclDetails.data['allowedViewCount'] == 0 && aclDetails.data['shareRequestId']) {
      throw new UnauthorizedException("You can't access this document as the file share has reached viewCount Limit")
    } else if (aclDetails.data['allowedViewCount'] > 0 && aclDetails.data['shareRequestId']) {
      // Decrease View Count of Access Control
      await this.accessService.updateViewCountByRestrictedKey(
        aclDetails.data['restrictedKey'],
        aclDetails.data['allowedViewCount'] - 1,
      )
    }

    if (aclDetails.data['shareRequestId'] != null && aclDetails.data['shareRequestId'] != '') {
      const requestDetails = await this.shareRequestModel.findById(aclDetails.data['shareRequestId'])

      if (requestDetails.status != 'ACCEPTED') {
        throw new UnauthorizedException("You can't access this document as the file share has been rejected.")
      }
    }

    if (currentTimestamp < aclDetails.data['expireTimeStamp']) {
      // The expiration timestamp has not yet been reached
      console.log('File is still valid.')

      await this.renderFileToResponse(res, aclDetails.data['fileSignedUrl'], restrictionKey)
    } else {
      // The expiration timestamp has passed
      console.log('File has expired.')

      // Checking if the Access is for a share request
      if (aclDetails.data['shareRequestId'] != null) {
        if (aclDetails.data['shareRequestId']) {
          throw new UnauthorizedException("You can't access this document as the file share has expired")
        }

        // Regenerate new accessControl Restriction Details
        const updatedAcl = await this.updateAccessControl(144, restrictionKey, fileDetails.data['fileKey'])

        // Update the fileUrl inside File to new ACL restrictedUrl
        await this.fileModel
          .findOneAndUpdate(
            { _id: fileDetails.data['_id'].toString() },
            { fileUrl: updatedAcl.data.data['restrictedUrl'] },
            { new: true },
          )
          .exec()

        console.log('updatedAcl')
        console.log(updatedAcl)

        await this.renderFileToResponse(
          res,
          updatedAcl.data.data['fileSignedUrl'],
          updatedAcl.data.data['restrictedKey'],
        )
      }
    }
  }

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
    console.log(`fileExt: ${fileExtension}`)
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true })
    }

    // Save the file
    const fileName = `${restrictionKey}.${fileExtension}`
    const fullPath = path.join(filePath, fileName)

    // Write PDF data to the file
    fs.writeFileSync(fullPath, visualResult, { encoding: 'binary' })
    console.log(`File ${fileName} saved successfully at ${fullPath}.`)
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
      res.status(404).send('File not found')
    }
  }

  async shareFile(userId: string, fileId: string, shareRequest: ShareFileRequestDto): Promise<StandardMessageResponse> {
    const fileDetails = await this.getFileByFileIdAndUserId(userId, fileId)

    if (fileDetails == null) {
      throw new NotFoundException('No file exists with this Id.')
    }

    if (fileDetails.data != null) {
      if (fileDetails.data['userId'] != userId) {
        throw new UnauthorizedException("You don't have the permission to share this file.")
      }

      if (fileDetails.data['softDeleted'] == true) {
        throw new ForbiddenException('You cannot share this file as its deleted, you need to recover it first.')
      }
    }

    const expiryTimeStamp = getFutureTimeStamp(shareRequest.restrictions.expiresIn)

    console.log(fileDetails.data['fileKey'])
    // Generating Aws signed file url
    const signedFileUrl = await this.s3Service.getSignedFileUrl(
      shareRequest.restrictions.expiresIn,
      fileDetails.data['fileKey'],
    )
    const restrictedFile = await this.accessService.createFileAccessControl(
      fileId,
      '',
      signedFileUrl,
      getFutureTimeStamp(shareRequest.restrictions.expiresIn),
      shareRequest.restrictions.viewCount,
    )
    console.log('restrictedFile')
    console.log(restrictedFile.data)
    if (restrictedFile.data == null) {
      throw new InternalServerErrorException('There was an error in generating access control for the file. Try again')
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
      'ACCEPTED',
      restrictedFile.data.restrictedUrl,
      userId,
      fileDetails.data['userId'],
      fileShareDetails,
    )
    console.log(createFileShareRequestDto)
    const shareRequestModel = new this.shareRequestModel(createFileShareRequestDto)
    const result = await shareRequestModel.save()

    await this.accessService.updateShareRequestIdByRestrictedKey(
      restrictedFile.data.restrictedKey,
      result['_id'].toString(),
    )
    console.log(result)
    if (result) {
      return {
        data: result,
      }
    } else {
      throw new NotFoundException('File with the fileId not found.')
    }
  }

  async requestShareFile(userId: string, shareRequest: RequestShareFileRequestDto): Promise<StandardMessageResponse> {
    if (shareRequest.restrictions.expiresIn > 168) {
      throw new BadRequestException('You cannot request the file for more than 7 days.')
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
      'PENDING',
      ' ',
      userId,
      shareRequest.requestedFromUser,
      fileShareDetails,
    )

    const shareRequestModel = new this.shareRequestModel(createFileShareRequestDto)
    const shareRequestResult = await shareRequestModel.save()

    if (shareRequestResult == null) {
      throw new InternalServerErrorException('There was an error in making a share request. Try again')
    }

    return {
      data: shareRequestResult,
    }
  }

  async deleteShareRequest(userId: string, requestId: string): Promise<StandardMessageResponse> {
    const requestDetails = await this.shareRequestModel.findById(requestId)

    if (requestDetails == null) {
      throw new NotFoundException('Request with the requestId not found.')
    }

    if (requestDetails['raisedByUser'] != userId) {
      throw new UnauthorizedException('You cannot delete this share request as you did not make this share request.')
    }

    const result = await this.shareRequestModel.findOneAndDelete({ _id: requestId })

    return {
      data: result,
    }
  }

  async respondToShareRequest(
    userId: string,
    requestId: string,
    fileId: string,
    action: string,
  ): Promise<StandardMessageResponse> {
    if (action != 'ACCEPTED' && action != 'REJECTED' && action != 'PENDING') {
      throw new Error('Please enter a valid action [ACCEPTED, REJECTED, PENDING]')
    }

    const requestDetails = await this.shareRequestModel.findOne({ _id: requestId })

    const fileDetails = await this.fileModel.findOne({ _id: fileId })

    if (requestDetails == null) {
      throw new NotFoundException('Request with the requestId not found.')
    }

    if (fileDetails == null) {
      throw new NotFoundException('File with the fileId not found.')
    }

    if (requestDetails['fileOwnerUser'] != userId) {
      throw new UnauthorizedException('You cannot respond to this share request as you are not the file owner.')
    }

    let actionResult = {}
    if (action == 'REJECTED') {
      actionResult = await this.shareRequestModel.findOneAndUpdate(
        { _id: requestId },
        {
          status: action,
          fileId: '',
          fileShareUrl: '',
        },
        { new: true },
      )
    } else if (action == 'ACCEPTED') {
      // Here if the action is ACCEPTED, then set the fileId and generate the restrictedUrl in the shareRequestModel

      console.log(requestDetails['fileShareDetails']['restrictions']['expiresIn'])
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

      if (restrictedFile.data == null) {
        throw new NotFoundException('Failed to respond to the request.')
      }

      console.log('restrictedUrl')
      console.log(restrictedFile.data['restrictedUrl'])
      // Update the shareRequest with the fileId, status and fileShareUrl

      actionResult = await this.shareRequestModel
        .findOneAndUpdate(
          { _id: requestId },
          {
            status: action,
            fileId: fileId,
            fileShareUrl: restrictedFile.data['restrictedUrl'],
          },
          { new: true },
        )
        .exec()
    }

    if (actionResult == null) {
      throw new InternalServerErrorException('Failed to respond to the request.')
    }

    return {
      data: actionResult,
    }
  }

  async getShareRequestsList(userId: string, queries: GetShareFileRequestsDto): Promise<StandardMessageResponse> {
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

      if (request.fileId && request.status === 'ACCEPTED') {
        const fileDetails = await this.getFilePublicDetailsByFileId(request.fileId)
        if (fileDetails.data != null) {
          updatedRequest['fileDetails'] = fileDetails.data
        }
      }

      updatedShareRequests.push(updatedRequest)
    }

    if (updatedShareRequests.length < 1) {
      throw new NotFoundException('Files not found')
    }

    return {
      data: updatedShareRequests,
    }
  }
}
