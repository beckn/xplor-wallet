import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { WalletController } from '../controller/wallet.controller'
// import { walletProviders } from '../provider/wallet.provider';
import { WalletModel, WalletSchema } from '../schemas/wallet.schema'
import { WalletService } from '../service/wallet.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: WalletModel, schema: WalletSchema }])],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [MongooseModule],
})
export class WalletModule {}
