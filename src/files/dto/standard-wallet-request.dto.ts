import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
export class StandardWalletRequestDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  readonly userId?: string

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  readonly walletId?: string

  constructor(userId?: string, walletId?: string) {
    this.userId = userId
    this.walletId = walletId
  }
}
