// axios.service.ts

import { BadGatewayException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'
import { LoggerMessage } from '../../common/constants/logger-message'
import { LoggerPayloadDto } from '../dto/logger.dto'

@Injectable()
export class GrafanaLoggerService {
  private readonly axiosInstance: AxiosInstance
  private readonly serviceName: string
  private readonly configService: ConfigService
  private readonly baseUrl: string

  constructor() {
    this.configService = new ConfigService()
    this.baseUrl = this.configService.get('GRAFANA_SERVICE_URL')
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl, // Replace with your API base URL
    })
    this.serviceName = LoggerMessage.serviceName
  }

  async sendLog(logger: LoggerPayloadDto) {
    try {
      const payload = { ...logger, serviceName: this.serviceName, message: JSON.stringify(logger.message) }
      return this.axiosInstance.post('/info', payload)
    } catch (error) {
      throw new BadGatewayException(error?.message)
    }
  }

  async sendError(logger: LoggerPayloadDto) {
    return this.axiosInstance.post('/error', {
      ...logger,
      serviceName: this.serviceName,
      message: JSON.stringify(logger.message),
    })
  }

  async sendDebug(logger: LoggerPayloadDto) {
    const payload = { ...logger, serviceName: this.serviceName, message: JSON.stringify(logger.message) }
    return this.axiosInstance.post('/debug', payload)
  }

  async sendWarn(logger: LoggerPayloadDto) {
    const payload = { ...logger, serviceName: this.serviceName, message: JSON.stringify(logger.message) }
    return this.axiosInstance.post('/warn', payload)
  }

  async sendVerbose(logger: LoggerPayloadDto) {
    const payload = { ...logger, serviceName: this.serviceName, message: JSON.stringify(logger.message) }
    return this.axiosInstance.post('/verbose', payload)
  }
}
