import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ViewAccessControlErrors } from '../../common/constants/error-messages'
import { StandardMessageResponse } from '../../common/constants/standard-message-response.dto'
import { RedisService } from '../../redis/service/redis.service'
import { VCAccessControl } from '../schemas/file-access-control.schema'

@Injectable()
export class VCAccessControlReadService {
  constructor(
    @InjectModel('VCAccessControl') private readonly vcAccessControlModel: Model<VCAccessControl>,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Finds ACl by restrictedKey
   */
  async findCachedByRestrictedKey(restrictedKey: string): Promise<StandardMessageResponse | any> {
    // Find with Redis first!
    const aclResult = await this.redisService.getValue(restrictedKey)

    if (!aclResult) {
      throw new NotFoundException(ViewAccessControlErrors.ACL_NOT_FOUND)
    }

    return aclResult
  }

  /**
   * Finds ACl by restrictedKey
   */
  async findByRestrictedKey(restrictedKey: string): Promise<StandardMessageResponse | any> {
    const aclResult = await this.vcAccessControlModel.findOne({ restrictedKey }).exec()

    if (!aclResult) {
      throw new NotFoundException(ViewAccessControlErrors.ACL_NOT_FOUND)
    }

    return aclResult
  }
}
