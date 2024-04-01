import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator'

class DIDDetails {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  fullName: string

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string
}

export class CreateUserDIDRequestDto {
  @ValidateNested()
  @ApiProperty()
  didDetails: DIDDetails

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  organization: string
}
