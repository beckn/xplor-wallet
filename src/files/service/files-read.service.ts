import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import 'multer'
import { FilesErrors } from '../../common/constants/error-messages'
import { File } from '../schemas/files.schema'

@Injectable()
export class FilesReadService {
  constructor(@InjectModel('File') private readonly fileModel: Model<File>) {}
  /**
   * Returns the file in with FileId
   */
  async getFileById(fileId: string): Promise<any> {
    const query: any = { _id: fileId }
    const fileDetails = await this.fileModel.findOne(query)

    if (!fileDetails) {
      throw new NotFoundException(FilesErrors.FILE_NOT_EXIST)
    }

    return fileDetails
  }

  /**
   * Returns the file without the stored URL
   */
  async getFileByIdWithoutStoredUrl(fileId: string): Promise<any> {
    const query: any = { _id: fileId }

    // Projection to exclude the stored URL
    const projection: any = { storedUrl: 0, fileKey: 0 }

    const fileDetails = await this.fileModel.findOne(query, projection)

    if (!fileDetails) {
      throw new NotFoundException(FilesErrors.FILE_NOT_EXIST)
    }

    return fileDetails
  }
}
