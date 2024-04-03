import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator'

export class DIDDetails {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  fullName: string

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string

  constructor(fullName: string, email: string) {
    this.fullName = fullName
    this.email = email
  }
}

export class CreateRegistryUserDIDRequestDto {
  @ValidateNested()
  @ApiProperty()
  didDetails: DIDDetails

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  organization: string

  constructor(didDetails: DIDDetails, organization: string) {
    this.didDetails = didDetails
    this.organization = organization
  }
}
