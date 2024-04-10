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
export class FilesDeleteService {
  constructor(
    @InjectModel('File') private readonly fileModel: Model<File>,
    private readonly apiClient: ApiClient,
    @Inject(S3StorageService) private readonly storageService: IStorageService,
    private readonly configService: ConfigService,
  ) {}
  /**
   * Returns the file in with FileId
   */
  async deleteFileById(fileId: string): Promise<any> {
    const fileDelete = await this.fileModel.findOneAndDelete({ _id: fileId })
    await this.storageService.deleteFileUrl(fileDelete['fileKey'])
    if (!fileDelete) {
      throw new NotFoundException(FilesErrors.FILE_NOT_EXIST)
    }

    return fileDelete
  }
}
