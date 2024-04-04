import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import 'multer'
import { ApiClient } from 'src/common/api-client'
import { VcType } from 'src/common/constants/enums'
import { FilesErrors } from 'src/common/constants/error-messages'
import { RegistryRequestRoutes } from 'src/common/constants/request-routes'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { SELF_ISSUED_VC_CONTEXT } from 'src/config/vc-schema.config'
import { generateVCExpirationDate, getCurrentTimeStamp } from 'src/utils/file.utils'
import { CreateVCRequestBodyDto } from 'src/verifiable-credential/dto/create-vc-request-body.dto'
import { VerifiableCredentialCreateService } from 'src/verifiable-credential/service/verifiable-credential-create.service'
import { WalletReadService } from 'src/wallet/service/wallet-read.service'
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
    private readonly s3Service: S3StorageService,
    private readonly configService: ConfigService,
  ) {}
  /**
   * Stores the file in Storage
   * Signs the stored file and generates an ACL for it for 7 Days (Max)
   * Creates a file document and stores in the database
   */
  async createFile(file: Express.Multer.File, body: CreateFileRequestDto): Promise<StandardMessageResponse | any> {
    //upload file to Storage
    const storeFileUrl = await this.s3Service.uploadFile(file)

    const createdFileModel = new CreateFileDto(body.walletId, file.mimetype, storeFileUrl)

    // Saved file to database
    const createdFileDocument = new this.fileModel(createdFileModel)
    const fileDocumentResult = await createdFileDocument.save()

    if (!fileDocumentResult) {
      throw new BadRequestException(FilesErrors.FILE_CREATE_ERROR)
    }

    const walletDetails = await this.walletReadService.findWalletByWalletId(body.walletId)
    const registryVCRequest = new CreateCredentialRequestDto(
      walletDetails['userDid'],
      new CredentialDto(
        SELF_ISSUED_VC_CONTEXT,
        this.configService.get('SELF_ISSUED_SCHEMA_ID'),
        this.configService.get('SELF_ISSUED_SCHEMA_VERSION'),
        generateVCExpirationDate(100),
        this.configService.get('SELF_ISSUED_ORGANIZATION_NAME'),
        {
          id: `did:${this.configService.get('SELF_ISSUED_ORGANIZATION_NAME')}`,
          type: 'SelfIssuedCredential',
          certificateLink: storeFileUrl,
        },
        ['VerifiableCredential', this.configService.get('SELF_ISSUED_SCHEMA_TAG')],
        body.tags,
      ),
    )

    const vcResult = await this.apiClient.post(
      this.configService.get('REGISTRY_SERVICE_URL') + RegistryRequestRoutes.CREATE_VC,
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

    const result = {
      fileData: fileDocumentResult,
      vcData: vcDocumentResult,
    }
    return result
  }
}
