import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
@Schema({ timestamps: true })
export class File {
  @Prop({ default: () => `file_${uuidv4()}` })
  _id: string

  @Prop({ required: true })
  walletId: string

  @Prop({ required: true })
  fileType: string

  @Prop({ required: true })
  fileKey: string

  @Prop({ required: true })
  storedUrl: string
}
export const FileModel = File.name
export type FileDocument = File & Document
export const FileSchema = SchemaFactory.createForClass(File)
