import { ApiProperty } from '@nestjs/swagger'

import { IHealthCheck, IProvider } from './app.interface'

export class HealthCheckEntity implements IHealthCheck {
  @ApiProperty({ description: 'The status of the health check.' })
  status: string

  @ApiProperty({ description: 'The version of the server.' })
  version: string

  @ApiProperty({ description: 'A message indicating the server status.' })
  serverMessage: string
}

export class ProviderEntity implements IProvider {
  @ApiProperty({ description: 'The code of the provider.' })
  code: string

  @ApiProperty({ description: 'The link to the provider icon.' })
  iconLink: string

  @ApiProperty({ description: 'The title of the provider.' })
  title: string

  @ApiProperty({ description: 'The subtitle of the provider.' })
  subTitle: string

  @ApiProperty({ description: 'The redirect URL of the provider.' })
  redirectUrl: string
}
