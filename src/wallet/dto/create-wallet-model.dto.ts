import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
export class CreateWalletModelDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly userId: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly userDid: string

  constructor(userId: string, userDid: string) {
    this.userId = userId
    this.userDid = userDid
  }
}
