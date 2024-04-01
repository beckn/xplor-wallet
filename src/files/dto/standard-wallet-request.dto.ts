import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
export class StandardWalletRequestDto {
  @IsString()
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  readonly userId?: string

  @IsString()
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  readonly walletId?: string

  constructor(userId?: string, walletId?: string) {
    this.userId = userId
    this.walletId = walletId
  }
}
