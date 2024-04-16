import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateWalletRequestDto {
  @IsString({ message: 'userId must be a string' })
  @IsNotEmpty({ message: 'userId must not be empty' })
  @ApiProperty()
  readonly userId: string

  @IsString({ message: 'fullName must be a string' })
  @IsNotEmpty({ message: 'fullName must not be empty' })
  @ApiProperty()
  readonly fullName: string

  @IsString({ message: 'email must be a string' })
  @IsNotEmpty({ message: 'email must not be empty' })
  @ApiProperty()
  readonly email: string

  @IsString({ message: 'organization must be a string' })
  @IsNotEmpty({ message: 'organization must not be empty' })
  @ApiProperty()
  readonly organization: string
}
