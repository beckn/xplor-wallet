import { Controller, Get } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { HealthCheckEntity } from './app.entity'
import { IHealthCheck } from './app.interface'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  @ApiResponse({
    status: 200,
    description: 'Returns a greeting message indicating the health status of the server.',
    type: HealthCheckEntity,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a greeting message indicating the health status of the server.',
    type: HealthCheckEntity, // Assuming HealthCheck is the interface or model representing the health check data
  })
  getHealth(): IHealthCheck {
    return this.appService.getHealthCheck()
  }

  getHello(): string {
    return 'Hello!'
  }
}
