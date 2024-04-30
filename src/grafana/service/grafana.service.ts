// axios.service.ts

import { BadGatewayException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'
import { LoggerEndpoints, LoggerMessage } from '../../common/constants/logger-message'
import { LoggerPayloadDto } from '../dto/logger.dto'

@Injectable()
export class GrafanaLoggerService {
  private readonly axiosInstance: AxiosInstance
  private readonly serviceName: string
  private readonly configService: ConfigService
  private readonly baseUrl: string
  private logger: Logger = new Logger(GrafanaLoggerService.name)

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
      return await this.axiosInstance.post(LoggerEndpoints.info, payload)
    } catch (error) {
      this.logger.error(error?.message)
      this.logger.log(JSON.stringify(logger))
      return new BadGatewayException(error?.message)
    }
  }

  async sendError(logger: LoggerPayloadDto) {
    try {
      return await this.axiosInstance.post(LoggerEndpoints.error, {
        ...logger,
        serviceName: this.serviceName,
        message: JSON.stringify(logger.message),
      })
    } catch (error) {
      this.logger.error(error?.message)
      this.logger.log(JSON.stringify(logger))
      return new BadGatewayException(error?.message)
    }
  }

  async sendDebug(logger: LoggerPayloadDto) {
    try {
      const payload = { ...logger, serviceName: this.serviceName, message: JSON.stringify(logger.message) }
      return await this.axiosInstance.post(LoggerEndpoints.debug, payload)
    } catch (error) {
      this.logger.error(error?.message)
      this.logger.log(JSON.stringify(logger))
      return new BadGatewayException(error?.message)
    }
  }

  async sendWarn(logger: LoggerPayloadDto) {
    try {
      const payload = { ...logger, serviceName: this.serviceName, message: JSON.stringify(logger.message) }
      return await this.axiosInstance.post(LoggerEndpoints.warn, payload)
    } catch (error) {
      this.logger.error(error?.message)
      this.logger.log(JSON.stringify(logger))
      return new BadGatewayException(error?.message)
    }
  }

  async sendVerbose(logger: LoggerPayloadDto) {
    try {
      const payload = { ...logger, serviceName: this.serviceName, message: JSON.stringify(logger.message) }
      return await this.axiosInstance.post(LoggerEndpoints.verbose, payload)
    } catch (error) {
      this.logger.error(error?.message)
      this.logger.log(JSON.stringify(logger))
      return new BadGatewayException(error?.message)
    }
  }
}
