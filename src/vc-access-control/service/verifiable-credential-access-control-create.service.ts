import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { VcApiRoutes } from 'src/common/constants/api-routes'
import { VcErrors } from 'src/common/constants/error-messages'
import { WALLET_SERVICE_URL } from 'src/common/constants/name-constants'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { RedisService } from 'src/redis/service/redis.service'
import { generateUrlUUID } from 'src/utils/file.utils'
import { generateCurrentIsoTime, getSecondsDifference } from 'src/utils/vc.utils'
import { CreateAccessControlDto } from 'src/vc-access-control/dto/create-access-control.dto'
import { VCAccessControl } from 'src/vc-access-control/schemas/file-access-control.schema'

@Injectable()
export class VCAccessControlCreateService {
  constructor(
    @InjectModel('VCAccessControl') private readonly vcAccessControlModel: Model<VCAccessControl>,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Generates a new VC Access control record to access a VC share.
   * This contains a decorator VC restrictedUrl and restrictedKey to show VC content
   */
  async createVcAccessControl(
    vcId: string,
    shareRequestId: string,
    expiresTimeStamp: string,
    viewOnce?: boolean,
  ): Promise<StandardMessageResponse | any> {
    // Generating unique restricted key and restrictedUrl
    const restrictedKey = generateUrlUUID()
    const restrictedUrl =
      this.configService.get(WALLET_SERVICE_URL) +
      VcApiRoutes.VC_REQUEST +
      VcApiRoutes.VIEW_FILE_REQUESTS +
      restrictedKey
    const accessModelDto = new CreateAccessControlDto(
      vcId,
      shareRequestId,
      restrictedKey,
      restrictedUrl,
      expiresTimeStamp,
      viewOnce,
      true,
    )

    const createdAcl = new this.vcAccessControlModel(accessModelDto)
    const aclResult = await createdAcl.save()

    if (!aclResult) {
      throw new InternalServerErrorException(VcErrors.ACL_GENERATION_ERROR)
    }

    await this.redisService.setWithExpiry(
      restrictedKey,
      JSON.stringify(aclResult),
      getSecondsDifference(generateCurrentIsoTime(), expiresTimeStamp),
    )
    return aclResult
  }
}
