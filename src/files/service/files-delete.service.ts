import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import 'multer'
import { ApiClient } from 'src/common/api-client'
import { FilesErrors } from 'src/common/constants/error-messages'
import { IStorageService } from 'src/common/constants/interface-storage-service'
import { VerifiableCredentialCreateService } from 'src/verifiable-credential/service/verifiable-credential-create.service'
import { WalletReadService } from 'src/wallet/service/wallet-read.service'
import { File } from '../schemas/files.schema'
import { S3StorageService } from './s3-storage.service'

@Injectable()
export class FilesDeleteService {
  constructor(
    @InjectModel('File') private readonly fileModel: Model<File>,
    private readonly vcCreateService: VerifiableCredentialCreateService,
    private readonly walletReadService: WalletReadService,
    private readonly apiClient: ApiClient,
    @Inject(S3StorageService) private readonly storageService: IStorageService,
    private readonly configService: ConfigService,
  ) {}
  /**
   * Returns the file in with FileId
   */
  async deleteFileById(fileId: string): Promise<any> {
    const fileDelete = await this.fileModel.findOneAndDelete({ _id: fileId })

    if (!fileDelete) {
      throw new NotFoundException(FilesErrors.FILE_NOT_EXIST)
    }

    return fileDelete
  }
}
