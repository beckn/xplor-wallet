import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { InternalMessages } from '../common/constants/error-messages'
import { UrlShortnerRequestRoutes } from '../common/constants/request-routes'
import { GrafanaLoggerService } from '../grafana/service/grafana.service'
@Injectable()
export class UrlShortenerUtil {
  constructor(private readonly urlShortenerServiceUrl: string) {}

  async createShortUrl(originalUrl: string): Promise<any> {
    try {
      const response = await axios.post(`${this.urlShortenerServiceUrl}${UrlShortnerRequestRoutes.CREATE_SHORT_URL}`, {
        originalUrl,
      })
      return response.data
    } catch (error) {
      new GrafanaLoggerService().sendDebug({
        message: `${InternalMessages.SIGNED_URL} ${error}`,
        methodName: this.createShortUrl.name,
      })
      return {}
    }
  }
}
