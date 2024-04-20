import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator'

export class CredentialDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  certificateLink: string

  @IsArray()
  @ApiProperty()
  tags: string[]

  constructor(certificateLink: string, tags: string[]) {
    this.certificateLink = certificateLink
    this.tags = tags
  }
}

export class CreateCredentialRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  issuerId: string

  @ValidateNested()
  @ApiProperty()
  credential: CredentialDto

  constructor(issuerId: string, credential: CredentialDto) {
    this.issuerId = issuerId
    this.credential = credential
  }
}
