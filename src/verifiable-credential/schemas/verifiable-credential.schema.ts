import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { VcType } from '../../common/constants/enums'
@Schema({ timestamps: true })
export class VerifiableCredential {
  @Prop({ default: () => `vc_${uuidv4()}` })
  _id: string

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

  @Prop({ required: true })
  iconUrl: string

  @Prop({ required: false })
  templateId: string

  @Prop({ required: true })
  restrictedUrl: string
}
export const VerifiableCredentialModel = VerifiableCredential.name
export type VerifiableCredentialDocument = VerifiableCredential & Document
export const VerifiableCredentialSchema = SchemaFactory.createForClass(VerifiableCredential)
