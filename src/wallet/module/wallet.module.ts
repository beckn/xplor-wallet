import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ApiClient } from '../../common/api-client'
import { WalletController } from '../controller/wallet.controller'
import { WalletModel, WalletSchema } from '../schemas/wallet.schema'
import { WalletCreateService } from '../service/wallet-create.service'
import { WalletDeleteService } from '../service/wallet-delete.service'
import { WalletReadService } from '../service/wallet-read.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: WalletModel, schema: WalletSchema }]), ApiClient],
  controllers: [WalletController],
  providers: [WalletReadService, WalletCreateService, WalletDeleteService, ApiClient],
  exports: [MongooseModule],
})
export class WalletModule {}
