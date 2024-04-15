import { ApiProperty } from '@nestjs/swagger'
import { ShareRequestAction } from 'aws-sdk/clients/auditmanager'
import { IsNotEmpty, IsString } from 'class-validator'

export class GetVCRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'wallet must not be empty' })
  @IsString({ message: 'walletId must be a string' })
  walletId: string

  @ApiProperty()
  @IsNotEmpty({ message: 'vcId must not be empty' })
  @IsString({ message: 'vcId must be a string' })
  vcId: string
}

export class GetShareRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'walletId must not be empty' })
  @IsString({ message: 'walletId must be a string' })
  walletId: string

  @ApiProperty()
  @IsNotEmpty({ message: 'requestId must not be empty' })
  @IsString({ message: 'requestId must be a string' })
  requestId: string
}

export class ShareVcRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'walletId must not be empty' })
  @IsString({ message: 'walletId must be a string' })
  walletId: string

  @ApiProperty()
  @IsNotEmpty({ message: 'requestId must not be empty' })
  @IsString({ message: 'requestId must be a string' })
  requestId: string

  @ApiProperty()
  @IsNotEmpty({ message: 'vcId must not be empty' })
  @IsString({ message: 'vcId must be a string' })
  vcId: string

  @ApiProperty()
  @IsNotEmpty({ message: 'action must not be empty' })
  action: ShareRequestAction
}
