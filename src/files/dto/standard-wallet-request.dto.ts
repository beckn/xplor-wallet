import { IsString } from 'class-validator'
export class StandardWalletRequestDto {
  @IsString()
  readonly userId?: string

  @IsString()
  readonly walletId?: string

  constructor(userId?: string, walletId?: string) {
    this.userId = userId
    this.walletId = walletId
  }
}
