import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { InternalMessages } from '../common/constants/error-messages'
import { UrlShortnerRequestRoutes } from '../common/constants/request-routes'
import { GrafanaLoggerService } from '../grafana/service/grafana.service'
import { ConfigService } from '@nestjs/config'
@Injectable()
export class UrlShortenerUtil {
  constructor(private readonly configService: ConfigService) {}

  async createShortUrl(originalUrl: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.configService.get('URL_SHORTNER_SERVICE_URL')}${UrlShortnerRequestRoutes.CREATE_SHORT_URL}`,
        {
          originalUrl,
        },
      )
      return response.data
    } catch (error) {
      new GrafanaLoggerService().sendDebug({
        message: `${InternalMessages.SIGNED_URL} ${error}`,
        methodName: this.createShortUrl.name,
      })
      throw error
    }
  }
}
