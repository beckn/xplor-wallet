import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateWalletRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly userId: string
}
