import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import 'multer'
import { ApiClient } from '../../common/api-client'
import { FilesErrors } from '../../common/constants/error-messages'
import { IStorageService } from '../../common/constants/interface-storage-service'
import { File } from '../schemas/files.schema'
import { S3StorageService } from './s3-storage.service'

@Injectable()
export class FilesUpdateService {
  constructor(
    @InjectModel('File') private readonly fileModel: Model<File>,
    private readonly apiClient: ApiClient,
    @Inject(S3StorageService) private readonly storageService: IStorageService,
    private readonly configService: ConfigService,
  ) {}
  /**
   * Refreshes the stored FileUrl
   */
  async refreshFileUrl(fileId: string): Promise<string> {
    const fileDetails = await this.fileModel.findOne({ _id: fileId })
    const fileKey = fileDetails.fileKey

    if (!fileKey) {
      throw new NotFoundException(FilesErrors.FILE_NOT_EXIST)
    }

    const newFileUrl = this.storageService.refreshFileUrl(fileKey)
    await this.fileModel.findOneAndUpdate({ _id: fileId }, { storedUrl: newFileUrl }, { new: true })
    return newFileUrl
  }
}
