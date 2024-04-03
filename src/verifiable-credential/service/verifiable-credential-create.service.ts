import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import 'multer'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { CreateVCRequestBodyDto } from '../dto/create-vc-request-body.dto'
import { VerifiableCredential } from '../schemas/verifiable-credential.schema'

@Injectable()
export class VerifiableCredentialCreateService {
  constructor(@InjectModel('VerifiableCredential') private readonly vcModel: Model<VerifiableCredential>) {}

  /*
  This function takes all the details of the VC & Stores them
   **/
  async createVerifiableCredential(vcRequest: CreateVCRequestBodyDto): Promise<StandardMessageResponse | any> {
    const createdVc = new this.vcModel(vcRequest)
    const fileResult = await createdVc.save()
    return fileResult
  }
}
