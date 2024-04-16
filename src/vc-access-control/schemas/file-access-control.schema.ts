import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
@Schema({ timestamps: true })
export class VCAccessControl {
  @Prop({ default: () => `acl_${uuidv4()}` })
  _id: string

  @Prop({ required: true })
  vcId: string

  @Prop({ required: false })
  shareRequestId: string

  @Prop({ required: true })
  restrictedKey: string // Unique identifier for the restrictedUrl

  @Prop({ required: true })
  restrictedUrl: string // Restricted end user Url that will be hit by the User

  @Prop({ required: true })
  expireTimeStamp: string

  @Prop({ required: true })
  viewAllowed: boolean

  @Prop({ required: true })
  viewOnce: boolean
}
export const VCAccessControlModel = VCAccessControl.name
export type VCAccessControlDocument = VCAccessControl & Document
export const VCAccessControlSchema = SchemaFactory.createForClass(VCAccessControl)
