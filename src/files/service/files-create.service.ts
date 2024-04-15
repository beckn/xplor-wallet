import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import 'multer'
import { ApiClient } from '../../common/api-client'
import { VcType } from '../../common/constants/enums'
import { FilesErrors } from '../../common/constants/error-messages'
import { IStorageService } from '../../common/constants/interface-storage-service'
import { REGISTRY_SERVICE_URL } from '../../common/constants/name-constants'
import { RegistryRequestRoutes } from '../../common/constants/request-routes'
import { StandardMessageResponse } from '../../common/constants/standard-message-response.dto'
import { getCurrentTimeStamp } from '../../utils/file.utils'
import { CreateVCRequestBodyDto } from '../../verifiable-credential/dto/create-vc-request-body.dto'
import { VerifiableCredentialCreateService } from '../../verifiable-credential/service/verifiable-credential-create.service'
import { WalletReadService } from '../../wallet/service/wallet-read.service'
import { CreateCredentialRequestDto, CredentialDto } from '../dto/create-credential-request.dto'
import { CreateFileRequestDto } from '../dto/create-file-request.dto'
import { CreateFileDto } from '../dto/create-file.dto'
import { File } from '../schemas/files.schema'
import { S3StorageService } from './s3-storage.service'

@Injectable()
export class FilesCreateService {
  constructor(
    @InjectModel('File') private readonly fileModel: Model<File>,
    private readonly vcCreateService: VerifiableCredentialCreateService,
    private readonly walletReadService: WalletReadService,
    private readonly apiClient: ApiClient,
    @Inject(S3StorageService) private readonly storageService: IStorageService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Stores the file in Storage
   * Signs the stored file and generates an ACL for it for 7 Days (Max)
   * Creates a file document and stores in the database
   */
  async createFile(file: Express.Multer.File, body: CreateFileRequestDto): Promise<StandardMessageResponse | any> {
    // Upload file to Storage
    const storeFileDetails = await this.storageService.uploadFile(file)

    const createdFileModel = new CreateFileDto(
      body.walletId,
      file.mimetype,
      storeFileDetails['signedUrl'],
      storeFileDetails['uploadedFile']['key'],
    )

    // Saved file to database
    const createdFileDocument = new this.fileModel(createdFileModel)
    const fileDocumentResult = await createdFileDocument.save()
    if (!fileDocumentResult) {
      throw new BadRequestException(FilesErrors.FILE_CREATE_ERROR)
    }

    const walletDetails = await this.walletReadService.findWalletByWalletId(body.walletId)
    const registryVCRequest = new CreateCredentialRequestDto(
      walletDetails['userDid'],
      new CredentialDto(storeFileDetails['uploadedFile']['key'], body.tags),
    )

    const vcResult = await this.apiClient.post(
      this.configService.get(REGISTRY_SERVICE_URL) + RegistryRequestRoutes.CREATE_VC,
      registryVCRequest,
    )
    if (!vcResult) {
      throw new BadRequestException(FilesErrors.FILE_CREATE_ERROR)
    }

    const createVcRequest = new CreateVCRequestBodyDto(
      vcResult['credential']['id'],
      fileDocumentResult['_id'].toString(),
      body.walletId,
      VcType.SELF_ISSUED,
      body.category,
      null,
      body.tags,
      `${body.name}-${getCurrentTimeStamp()}`,
    )
    // Create a VC for this file!
    const vcDocumentResult = await this.vcCreateService.createVerifiableCredential(createVcRequest)
    return { ...vcDocumentResult.toJSON(), fileData: fileDocumentResult }
  }
}
