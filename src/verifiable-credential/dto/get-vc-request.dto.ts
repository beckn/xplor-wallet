import { ApiProperty } from '@nestjs/swagger'
import { ShareRequestAction } from 'aws-sdk/clients/auditmanager'
import { IsString } from 'class-validator'

export class GetVCRequestDto {
  @ApiProperty()
  @IsString()
  walletId: string

  @ApiProperty()
  @IsString()
  vcId: string
}

export class GetShareRequestDto {
  @ApiProperty()
  @IsString()
  walletId: string

  @ApiProperty()
  @IsString()
  requestId: string
}

export class ShareVcRequestDto {
  @ApiProperty()
  @IsString()
  walletId: string

  @ApiProperty()
  @IsString()
  requestId: string

  @ApiProperty()
  @IsString()
  vcId: string

  @ApiProperty()
  action: ShareRequestAction
}
