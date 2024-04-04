import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { VcType } from 'src/common/constants/enums'

@Schema({ timestamps: true })
export class VerifiableCredential {
  @Prop({ required: true })
  did: string

  @Prop({ required: false })
  fileId: string

  @Prop({ required: true })
  walletId: string

  @Prop({ required: true, enum: VcType })
  type: string

  @Prop({ required: true })
  category: string

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ required: true })
  name: string

  @Prop({ required: false })
  templateId: string
}
export const VerifiableCredentialModel = VerifiableCredential.name
export type VerifiableCredentialDocument = VerifiableCredential & Document
export const VerifiableCredentialSchema = SchemaFactory.createForClass(VerifiableCredential)
