import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateWalletRequestDto {
  @IsString({ message: 'userId field must be a string' })
  @IsNotEmpty({ message: 'userId field must not be empty' })
  @ApiProperty()
  readonly userId: string

  @IsString({ message: 'fullName field must be a string' })
  @IsNotEmpty({ message: 'fullName field must not be empty' })
  @ApiProperty()
  readonly fullName: string

  @IsString({ message: 'email field must be a string' })
  @IsNotEmpty({ message: 'email field must not be empty' })
  @ApiProperty()
  readonly email: string

  @IsString({ message: 'organization field must be a string' })
  @IsNotEmpty({ message: 'organization field must not be empty' })
  @ApiProperty()
  readonly organization: string
}
