import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ViewAccessControlErrors } from 'src/common/constants/error-messages'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { VCAccessControl } from '../schemas/file-access-control.schema'

@Injectable()
export class VCAccessControlReadService {
  constructor(
    @InjectModel('VCAccessControl') private readonly vcAccessControlModel: Model<VCAccessControl>,
    private readonly configService: ConfigService,
  ) {}

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
