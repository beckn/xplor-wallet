import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { FileAccessControlErrors } from 'src/common/constants/error-messages'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { generateUrlUUID } from 'src/utils/file.utils'
import { CreateAccessControlDto } from '../dto/create-access-control.dto'
import { FileAccessControl } from '../schemas/file-access-control.schema'

@Injectable()
export class FileAccessControlService {
  constructor(
    @InjectModel('FileAccessControl') private readonly filesAccessControlModel: Model<FileAccessControl>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates a new File Access control record to access a file share.
   * Max Duration 7 Days for each File ACL Request
   * This contains a decorator file restrictedUrl and restrictedKey to show file content
   */
  async createFileAccessControl(
    fileId: string,
    shareRequestId: string,
    signedUrl: string,
    expiresTimeStamp: number,
    allowedViewCount?: number,
  ): Promise<StandardMessageResponse | any> {
    // Generating unique restricted key and restrictedUrl
    const restrictedKey = generateUrlUUID()
    const restrictedUrl = this.configService.get('SERVICE_BASE_URL') + 'wallet/files/view/' + restrictedKey
    const accessModelDto = new CreateAccessControlDto(
      fileId,
      shareRequestId,
      restrictedKey,
      restrictedUrl,
      signedUrl,
      expiresTimeStamp,
      allowedViewCount,
    )

    const createdAcl = new this.filesAccessControlModel(accessModelDto)
    const fileResult = await createdAcl.save()
    return fileResult
  }

  /**
   * Finds and updates signedUrl of the File and the expiration time using restrictedKey
   */
  async updateRestrictionsByRestrictionKey(
    resKey: string,
    signedUrl: string,
    expiresTimeStamp: number,
  ): Promise<StandardMessageResponse | any> {
    // Generating unique restricted key and restrictedUrl
    const restrictedKey = generateUrlUUID()
    const restrictedUrl = this.configService.get('SERVICE_BASE_URL') + 'files/view/' + restrictedKey

    // Update the document with the given restriction key
    const updatedDocument = await this.filesAccessControlModel
      .findOneAndUpdate(
        { restrictedKey: resKey }, // Find the document with the matching restriction key
        {
          $set: {
            restrictedKey: restrictedKey, // Update the restriction key
            restrictedUrl: restrictedUrl, // Update the restriction URL
            expireTimeStamp: expiresTimeStamp, // Update the expiration timestamp
            fileSignedUrl: signedUrl, // Update the signed URL
          },
        },
        { new: true }, // Return the updated document
      )
      .exec()

    if (!updatedDocument) {
      throw new NotFoundException(FileAccessControlErrors.DOCUMENT_NOT_FOUND)
    }

    return updatedDocument
  }

  /**
   * Finds and updates shareRequestId of the File using restrictedKey
   */
  async updateShareRequestIdByRestrictedKey(
    restrictedKey: string,
    shareRequestId: string,
  ): Promise<StandardMessageResponse | any> {
    const updatedAcl = await this.filesAccessControlModel
      .findOneAndUpdate({ restrictedKey }, { $set: { shareRequestId: shareRequestId } }, { new: true })
      .exec()

    if (!updatedAcl) {
      throw new NotFoundException(FileAccessControlErrors.ACL_NOT_FOUND)
    }

    return updatedAcl
  }

  /**
   * Finds and updates viewCount of the shareRequest using restrictedKey
   */
  async updateViewCountByRestrictedKey(
    restrictedKey: string,
    viewCount: number,
  ): Promise<StandardMessageResponse | any> {
    const updatedAcl = await this.filesAccessControlModel
      .findOneAndUpdate({ restrictedKey }, { $set: { allowedViewCount: viewCount } }, { new: true })
      .exec()

    if (!updatedAcl) {
      throw new NotFoundException(FileAccessControlErrors.ACL_NOT_FOUND)
    }

    return updatedAcl
  }

  /**
   * Finds and updates FileId of the File using restrictedKey
   */
  async updateFileIdByRestrictedKey(restrictedKey: string, newFileId: string): Promise<StandardMessageResponse | any> {
    const updatedAcl = await this.filesAccessControlModel
      .findOneAndUpdate({ restrictedKey }, { $set: { fileId: newFileId } }, { new: true })
      .exec()

    if (!updatedAcl) {
      throw new NotFoundException(FileAccessControlErrors.ACL_NOT_FOUND)
    }

    return updatedAcl
  }

  /**
   * Finds ACl by restrictedKey
   */
  async findByRestrictedKey(restrictedKey: string): Promise<StandardMessageResponse | any> {
    const aclResult = await this.filesAccessControlModel.findOne({ restrictedKey }).exec()

    if (!aclResult) {
      throw new NotFoundException(FileAccessControlErrors.ACL_NOT_FOUND)
    }

    return aclResult
  }
}
