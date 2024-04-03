import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class GetVCRequestDto {
  @ApiProperty()
  @IsString()
  walletId: string

  @ApiProperty()
  @IsString()
  vcId: string
}
