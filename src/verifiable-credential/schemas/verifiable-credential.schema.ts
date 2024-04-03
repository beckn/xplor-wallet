import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { VcCategory } from 'src/common/constants/enums'

@Schema({ timestamps: true })
export class VerifiableCredential {
  @Prop({ required: true })
  did: string

  @Prop({ required: true })
  fileId: string

  @Prop({ required: true })
  walletId: string

  @Prop({ required: true })
  type: string

  @Prop({ required: true, enum: VcCategory })
  category: string

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  templateId: string
}
export const VerifiableCredentialModel = VerifiableCredential.name
export type VerifiableCredentialDocument = VerifiableCredential & Document
export const VerifiableCredentialSchema = SchemaFactory.createForClass(VerifiableCredential)
