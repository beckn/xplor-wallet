import { Injectable } from '@nestjs/common'
import { IHealthCheck } from './app.interface'

@Injectable()
export class AppService {
  getHealthCheck(): IHealthCheck {
    return {
      status: 'ok',
      version: '1.0.0',
      serverMessage: 'Server is up and running',
    }
  }
}
