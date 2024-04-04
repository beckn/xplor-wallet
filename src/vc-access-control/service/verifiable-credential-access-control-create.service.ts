import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { generateUrlUUID } from 'src/utils/file.utils'
import { CreateAccessControlDto } from '../dto/create-access-control.dto'
import { VCAccessControl } from '../schemas/file-access-control.schema'

@Injectable()
export class VCAccessControlCreateService {
  constructor(
    @InjectModel('VCAccessControl') private readonly vcAccessControlModel: Model<VCAccessControl>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generates a new File Access control record to access a file share.
   * Max Duration 7 Days for each File ACL Request
   * This contains a decorator file restrictedUrl and restrictedKey to show file content
   */
  async createVcAccessControl(
    vcId: string,
    shareRequestId: string,
    signedUrl: string,
    expiresTimeStamp: string,
    viewOnce?: boolean,
  ): Promise<StandardMessageResponse | any> {
    // Generating unique restricted key and restrictedUrl
    const restrictedKey = generateUrlUUID()
    const restrictedUrl = this.configService.get('WALLET_SERVICE_URL') + '/view/' + restrictedKey
    const accessModelDto = new CreateAccessControlDto(
      vcId,
      shareRequestId,
      restrictedKey,
      restrictedUrl,
      signedUrl,
      expiresTimeStamp,
      viewOnce,
      true,
    )

    const createdAcl = new this.vcAccessControlModel(accessModelDto)
    const aclResult = await createdAcl.save()
    return aclResult
  }
}
