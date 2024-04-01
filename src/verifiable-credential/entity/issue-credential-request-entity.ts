import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDateString, IsNotEmpty, IsString, ValidateNested } from 'class-validator'

export class SampleCredentialSubject {
  @IsString()
  @ApiProperty()
  FullName: string

  @IsString()
  @ApiProperty()
  CourseName: string

  @IsString()
  @ApiProperty()
  Skill: string
}

export class CredentialReceiverEntity {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userId: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  documentType: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  documentName: string
}

class CredentialDtoEntity {
  @IsArray()
  @ApiProperty()
  context: any[]

  @IsString()
  @ApiProperty()
  templateId: string

  @IsString()
  @ApiProperty()
  schemaId: string

  @IsString()
  @ApiProperty()
  schemaVersion: string

  @IsDateString()
  @ApiProperty()
  expirationDate: string

  @IsString()
  @ApiProperty()
  organization: string

  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty()
  credentialSubject: SampleCredentialSubject

  @IsArray()
  @ApiProperty()
  type: string[]

  @IsArray()
  @ApiProperty()
  tags: string[]

  constructor(
    context: string[],
    templateId: string,
    schemaId: string,
    schemaVersion: string,
    expirationDate: string,
    organization: string,
    credentialSubject: SampleCredentialSubject,
    type: string[],
    tags: string[],
  ) {
    this.context = context
    this.templateId = templateId
    this.schemaId = schemaId
    this.schemaVersion = schemaVersion
    this.expirationDate = expirationDate
    this.organization = organization
    this.credentialSubject = credentialSubject
    this.type = type
    this.tags = tags
  }
}

export class IssueCredentialRequestEntityDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  issuerId: string

  @ValidateNested()
  @ApiProperty()
  credentialReceiver: CredentialReceiverEntity

  @ValidateNested()
  @ApiProperty()
  credential: CredentialDtoEntity
}
