import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import 'multer'
import { ApiClient } from '../../common/api-client'
import { FilesErrors } from '../../common/constants/error-messages'
import { IStorageService } from '../../common/constants/interface-storage-service'
import { VerifiableCredentialCreateService } from '../../verifiable-credential/service/verifiable-credential-create.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { File } from '../schemas/files.schema'
import { S3StorageService } from './s3-storage.service'

@Injectable()
export class FilesReadService {
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
  async getFileById(fileId: string): Promise<any> {
    const query: any = { _id: fileId }
    const fileDetails = await this.fileModel.findOne(query)

    if (!fileDetails) {
      throw new NotFoundException(FilesErrors.FILE_NOT_EXIST)
    }

    return fileDetails
  }
}
