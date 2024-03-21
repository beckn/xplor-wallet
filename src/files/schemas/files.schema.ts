import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class File {
  @Prop({ required: true })
  userId: string

  @Prop({ required: true })
  fileType: string

  @Prop({ type: [String], default: [] })
  fileTags: string[]

  @Prop({ required: true })
  fileName: string

  @Prop({ required: true, default: false })
  softDeleted: boolean

  @Prop({ required: true })
  fileKey: string

  @Prop({ required: true })
  fileUrl: string

  @Prop({ type: Object }) // Dynamic JSON object for metadata
  metadata: Record<string, any>
}
export const FileModel = File.name
export type FileDocument = File & Document
export const FileSchema = SchemaFactory.createForClass(File)
