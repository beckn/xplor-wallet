import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import 'multer'
import { VcErrors } from 'src/common/constants/error-messages'
import { GetVCListRequestDto } from '../dto/get-vc-list-request.dto'
import { GetVCRequestDto } from '../dto/get-vc-request.dto'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'

@Injectable()
export class VerifiableCredentialReadService {
  constructor(
    @InjectModel('VerifiableCredential') private readonly vcModel: Model<VerifiableCredential>,
    private readonly configService: ConfigService,
  ) {}

  /*
  This function returns list of VCs in the document and also applys search queries.
   **/
  async getAllWalletVc(queryParams: GetVCListRequestDto, skip: number): Promise<any> {
    const query: any = { walletId: queryParams.walletId }
    if (queryParams.category) {
      query.category = queryParams.category
    }

    if (queryParams.tags && queryParams.tags.length > 0) {
      query.tags = { $in: queryParams.tags }
    }

    // Add the search query condition to the query
    if (queryParams.searchQuery) {
      const regex = new RegExp(queryParams.searchQuery, 'i') // Case-insensitive regex pattern
      query.$or = [
        { name: { $regex: regex } },
        { category: { $regex: regex } },
        // Add more fields if needed
      ]
    }

    // Execute the query with pagination using the Mongoose model
    const filesResult = await this.vcModel.find(query).skip(skip).limit(queryParams.pageSize)

    if (filesResult.length < 1) {
      throw new NotFoundException(VcErrors.VCs_NOT_FOUND)
    }

    return filesResult
  }

  /*
  This function returns VC with the vcId and walletId
   **/
  async getVCById(queryParams: GetVCRequestDto): Promise<any> {
    const query: any = { walletId: queryParams.walletId, _id: queryParams.vcId }
    const vcDetails = await this.vcModel.findOne(query)

    if (vcDetails == null) {
      throw new NotFoundException(VcErrors.VC_NOT_EXIST)
    }

    return vcDetails
  }
}
