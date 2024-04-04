import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { ShareRequestAction } from 'src/common/constants/enums'

class Restrictions {
  @Prop({ required: true })
  expireTimeStamp: number
  viewOnce?: boolean

  constructor(expireTimeStamp: number, viewOnce?: boolean) {
    this.expireTimeStamp = expireTimeStamp
    this.viewOnce = viewOnce
  }
}

class VcShareDetails {
  @Prop({ required: true })
  certificateType: string //10th board result, skill certificate etc..

  @Prop({ required: true })
  restrictions: Restrictions
}

@Schema({ timestamps: true })
export class ShareRequest {
  @Prop({ required: true })
  vcId: string

  @Prop({ required: true, enum: ShareRequestAction })
  status: string

  @Prop({ required: true })
  restrictedUrl: string

  @Prop({ required: true })
  raisedByWallet: string

  @Prop({ required: true })
  vcOwnerWallet: string

  @Prop({ required: true })
  vcShareDetails: VcShareDetails
}
export const ShareRequestModel = ShareRequest.name
export type ShareRequestDocument = ShareRequest & Document
export const ShareRequestSchema = SchemaFactory.createForClass(ShareRequest)
