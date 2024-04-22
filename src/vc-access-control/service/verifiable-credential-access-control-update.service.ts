import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { VcApiRoutes } from '../../common/constants/api-routes'
import { ViewAccessControlErrors } from '../../common/constants/error-messages'
import { WALLET_SERVICE_URL } from '../../common/constants/name-constants'
import { StandardMessageResponse } from '../../common/constants/standard-message-response.dto'
import { RedisService } from '../../redis/service/redis.service'
import { generateUrlUUID } from '../../utils/file.utils'
import { VCAccessControl } from '../schemas/file-access-control.schema'

@Injectable()
export class VCAccessControlUpdateService {
  constructor(
    @InjectModel('VCAccessControl') private readonly vcAccessControlModel: Model<VCAccessControl>,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Finds and updates signedUrl of the VC and the expiration time using restrictedKey
   */
  async updateRestrictionsByRestrictionKey(
    resKey: string,
    expiresTimeStamp: number,
  ): Promise<StandardMessageResponse | any> {
    // Update the document with the given restriction key
    const updatedDocument = await this.vcAccessControlModel
      .findOneAndUpdate(
        { restrictedKey: resKey }, // Find the document with the matching restriction key
        {
          $set: {
            restrictedKey: resKey, // Update the restriction key
            expireTimeStamp: expiresTimeStamp, // Update the expiration timestamp
          },
        },
        { new: true }, // Return the updated document
      )
      .then()

    if (!updatedDocument) {
      throw new NotFoundException(ViewAccessControlErrors.DOCUMENT_NOT_FOUND)
    }

    return updatedDocument
  }

  async updateViewOnceByRestrictionKey(resKey: string, viewOnce: boolean): Promise<StandardMessageResponse | any> {
    // Update the document with the given restriction key
    const updatedDocument = await this.vcAccessControlModel
      .findOneAndUpdate(
        { restrictedKey: resKey }, // Find the document with the matching restriction key
        {
          $set: {
            restrictedKey: resKey, // Update the restriction key
            viewOnce: viewOnce, // Update the expiration timestamp
          },
        },
        { new: true }, // Return the updated document
      )
      .then()

    if (!updatedDocument) {
      throw new NotFoundException(ViewAccessControlErrors.DOCUMENT_NOT_FOUND)
    }

    return updatedDocument
  }

  /**
   * Finds and updates viewAllowed of the VC and the expiration time using restrictedKey
   */
  async updateViewAllowedByRestrictionKey(
    resKey: string,
    viewAllowed: boolean,
  ): Promise<StandardMessageResponse | any> {
    // Update the document with the given restriction key
    const updatedDocument = await this.vcAccessControlModel
      .findOneAndUpdate(
        { restrictedKey: resKey }, // Find the document with the matching restriction key
        {
          $set: {
            viewAllowed: viewAllowed, // Update the signed URL
          },
        },
        { new: true }, // Return the updated document
      )
      .then()

    // Update the field in redis cache
    await this.redisService.updateField(resKey, 'viewAllowed', viewAllowed)
    if (!updatedDocument) {
      throw new NotFoundException(ViewAccessControlErrors.DOCUMENT_NOT_FOUND)
    }

    return updatedDocument
  }

  /**
   * Finds and updates shareRequestId of the VC using restrictedKey
   */
  async updateShareRequestIdByRestrictedKey(
    restrictedKey: string,
    shareRequestId: string,
  ): Promise<StandardMessageResponse | any> {
    const updatedAcl = await this.vcAccessControlModel
      .findOneAndUpdate({ restrictedKey }, { $set: { shareRequestId: shareRequestId } }, { new: true })
      .then()

    if (!updatedAcl) {
      throw new NotFoundException(ViewAccessControlErrors.ACL_NOT_FOUND)
    }

    return updatedAcl
  }

  /**
   * Finds and updates VcId of the VC using restrictedKey
   */
  async updateVcIdByRestrictedKey(restrictedKey: string, vcId: string): Promise<StandardMessageResponse | any> {
    const updatedAcl = await this.vcAccessControlModel
      .findOneAndUpdate({ restrictedKey }, { $set: { vcId: vcId } }, { new: true })
      .then()

    if (!updatedAcl) {
      throw new NotFoundException(ViewAccessControlErrors.ACL_NOT_FOUND)
    }

    await this.redisService.updateField(restrictedKey, 'vcId', vcId)
    return updatedAcl
  }

  async renewAccessControl(restrictedKey: string, expiryTimeStamp: string) {
    const updatedDocument = await this.vcAccessControlModel
      .findOneAndUpdate(
        { restrictedKey: restrictedKey },
        {
          $set: {
            expireTimeStamp: expiryTimeStamp,
          },
        },
        { new: true },
      )
      .then()
    return updatedDocument
  }
}
