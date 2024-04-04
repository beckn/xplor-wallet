import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class File {
  @Prop({ required: true })
  walletId: string

  @Prop({ required: true })
  fileType: string

  @Prop({ required: true })
  storedUrl: string
}
export const FileModel = File.name
export type FileDocument = File & Document
export const FileSchema = SchemaFactory.createForClass(File)
