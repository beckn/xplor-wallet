import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { generateUrlUUID } from 'src/utils/file.utils'
import { CreateAccessControlDto } from '../dto/create-access-control.dto'
import { FileAccessControl } from '../schemas/file-access-control.schema'

@Injectable()
export class FileAccessControlService {
  constructor(@InjectModel('FileAccessControl') private readonly filesAccessControlModel: Model<FileAccessControl>) {}

  async createFileAccessControl(
    fileId: string,
    shareRequestId: string,
    signedUrl: string,
    expiresTimeStamp: number,
    allowedViewCount?: number,
  ): Promise<StandardMessageResponse> {
    // Generating unique restricted key and restrictedUrl
    const restrictedKey = generateUrlUUID()
    const restrictedUrl = process.env.SERVICE_BASE_URL + 'wallet/files/view/' + restrictedKey
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
    console.log(fileResult)
    return {
      data: fileResult,
    }
  }

  async updateRestrictionsByRestrictionKey(
    resKey: string,
    signedUrl: string,
    expiresTimeStamp: number,
  ): Promise<StandardMessageResponse> {
    // Generating unique restricted key and restrictedUrl
    const restrictedKey = generateUrlUUID()
    const restrictedUrl = process.env.SERVICE_BASE_URL + 'files/view/' + restrictedKey

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
      throw new Error('No document found with the provided restriction key.')
    }

    return {
      data: updatedDocument,
    }
  }

  async updateShareRequestIdByRestrictedKey(
    restrictedKey: string,
    shareRequestId: string,
  ): Promise<StandardMessageResponse> {
    const updatedAcl = await this.filesAccessControlModel
      .findOneAndUpdate({ restrictedKey }, { $set: { shareRequestId: shareRequestId } }, { new: true })
      .exec()

    if (!updatedAcl) {
      throw new Error('Access control document not found for the provided restrictedKey')
    }

    return {
      data: updatedAcl,
    }
  }

  async updateViewCountByRestrictedKey(restrictedKey: string, viewCount: number): Promise<StandardMessageResponse> {
    const updatedAcl = await this.filesAccessControlModel
      .findOneAndUpdate({ restrictedKey }, { $set: { allowedViewCount: viewCount } }, { new: true })
      .exec()

    if (!updatedAcl) {
      throw new Error('Access control document not found for the provided restrictedKey')
    }

    return {
      data: updatedAcl,
    }
  }

  async updateFileIdByRestrictedKey(restrictedKey: string, newFileId: string): Promise<StandardMessageResponse> {
    const updatedAcl = await this.filesAccessControlModel
      .findOneAndUpdate({ restrictedKey }, { $set: { fileId: newFileId } }, { new: true })
      .exec()

    if (!updatedAcl) {
      throw new Error('Access control document not found for the provided restrictedKey')
    }

    return {
      data: updatedAcl,
    }
  }

  async findByRestrictedKey(restrictedKey: string): Promise<StandardMessageResponse> {
    const aclResult = await this.filesAccessControlModel.findOne({ restrictedKey }).exec()

    if (!aclResult) {
      throw new Error('Access control document not found for the provided restrictedKey')
    }

    return {
      data: aclResult,
    }
  }
}
