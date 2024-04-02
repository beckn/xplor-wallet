import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { FileType, ShareRequestAction } from 'src/common/constants/enums'

class Restrictions {
  @Prop({ required: true })
  expireTimeStamp: number
  viewCount?: number
  downloadEnabled?: boolean
  sharedWithUsers?: string[]

  constructor(expireTimeStamp: number, viewCount?: number, downloadEnabled?: boolean, sharedWithUsers?: string[]) {
    this.expireTimeStamp = expireTimeStamp
    this.viewCount = viewCount
    this.downloadEnabled = downloadEnabled
    this.sharedWithUsers = sharedWithUsers
  }
}

class FileShareDetails {
  @Prop({ required: true, enum: FileType })
  type: string

  @Prop({ required: true })
  documentType: string //10th board result, skill certificate etc..

  @Prop({ required: true })
  restrictions: Restrictions
}

@Schema({ timestamps: true })
export class ShareRequest {
  @Prop({ required: true })
  fileId: string

  @Prop({ required: true, enum: ShareRequestAction })
  status: string

  @Prop({ required: true })
  fileShareUrl: string

  @Prop({ required: true })
  raisedByUser: string

  @Prop({ required: true })
  fileOwnerUser: string

  @Prop({ required: true })
  fileShareDetails: FileShareDetails
}
export const ShareRequestModel = ShareRequest.name
export type ShareRequestDocument = ShareRequest & Document
export const ShareRequestSchema = SchemaFactory.createForClass(ShareRequest)
