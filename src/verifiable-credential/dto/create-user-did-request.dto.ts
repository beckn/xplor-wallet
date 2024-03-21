import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator'

class DIDDetails {
  @IsNotEmpty()
  @IsString()
  fullName: string

  @IsNotEmpty()
  @IsEmail()
  email: string
}

export class CreateUserDIDRequestDto {
  @ValidateNested()
  didDetails: DIDDetails

  @IsNotEmpty()
  @IsString()
  organization: string
}
