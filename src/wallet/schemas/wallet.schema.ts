import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class Wallet {
  @Prop({ required: true })
  userId: string

  @Prop({ required: true })
  userDid: string
}

export const WalletModel = Wallet.name
export type WalletDocument = Wallet & Document
export const WalletSchema = SchemaFactory.createForClass(Wallet)
