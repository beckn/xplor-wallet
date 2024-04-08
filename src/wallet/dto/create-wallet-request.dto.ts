import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateWalletRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly userId: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly fullName: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly email: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly organization: string
}
