import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class FileAccessControl {
  @Prop({ required: true })
  fileId: string

  @Prop({ required: false })
  shareRequestId: string

  @Prop({ required: true })
  restrictedKey: string // Unique identifier for the restrictedUrl

  @Prop({ required: true })
  restrictedUrl: string // Restricted end user Url that will be hit by the User

  @Prop({ required: true })
  fileSignedUrl: string // AWS signed Url

  @Prop({ required: true })
  expireTimeStamp: number

  @Prop({ required: true })
  allowedViewCount: number
}
export const FileAccessControlModel = FileAccessControl.name
export type FileAccessControlDocument = FileAccessControl & Document
export const FileAccessControlSchema = SchemaFactory.createForClass(FileAccessControl)
