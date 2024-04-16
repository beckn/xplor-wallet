import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
@Schema({ timestamps: true })
export class Wallet extends Document {
  @Prop({ default: () => `wallet_${uuidv4()}` })
  _id: string

  @Prop({ required: true })
  userId: string

  @Prop({ required: true })
  userDid: string
}

export const WalletModel = Wallet.name
export type WalletDocument = Wallet & Document
export const WalletSchema = SchemaFactory.createForClass(Wallet)
