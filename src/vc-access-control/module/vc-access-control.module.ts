import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ApiClient } from '../../common/api-client'
import { RedisModule } from '../../redis/module/redis.module'
import { VCAccessControl, VCAccessControlSchema } from '../schemas/file-access-control.schema'
import { VCAccessControlCreateService } from '../service/verifiable-credential-access-control-create.service'
import { VCAccessControlUpdateService } from '../service/verifiable-credential-access-control-update.service'
import { UrlShortenerUtil } from '../../utils/url-shortner.util'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VCAccessControl.name, schema: VCAccessControlSchema }]),
    ApiClient,
    RedisModule,
  ],
  providers: [
    VCAccessControlCreateService,
    VCAccessControlUpdateService,
    ApiClient,
    {
      provide: UrlShortenerUtil,
      useFactory: (configService: ConfigService) => {
        const urlShortenerServiceUrl = configService.get<string>('URL_SHORTENER_SERVICE_URL')
        return new UrlShortenerUtil(urlShortenerServiceUrl)
      },
      inject: [ConfigService],
    },
  ],
  exports: [VCAccessControlCreateService, VCAccessControlUpdateService], // Export the service to be available in other modules
})
export class VCAccessControlModule {}
