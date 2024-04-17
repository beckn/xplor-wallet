import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator'

export class CreateWalletRequestDto {
  @IsString({ message: 'userId field must be a string' })
  @IsNotEmpty({ message: 'userId field must not be empty' })
  @ApiProperty()
  readonly userId: string

  @IsString({ message: 'fullName field must be a string' })
  @Length(1, 50, { message: 'Full name must be between 1 and 50 characters' })
  @Matches(/^[a-zA-Z]+[a-zA-Z\s]*$/, { message: 'fullName must contain at least one alphabet' })
  @IsNotEmpty({ message: 'fullName field must not be empty' })
  @ApiProperty()
  readonly fullName: string

  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Invalid email format' })
  @IsString({ message: 'email field must be a string' })
  @IsNotEmpty({ message: 'email field must not be empty' })
  @ApiProperty()
  readonly email: string

  @Matches(/^[a-zA-Z]+[a-zA-Z\s]*$/, { message: 'Organization must contain at least one alphabet' })
  @Length(1, 50, { message: 'Organization must be between 1 and 50 characters' })
  @IsString({ message: 'organization field must be a string' })
  @IsNotEmpty({ message: 'organization field must not be empty' })
  @ApiProperty()
  readonly organization: string
}
