import { IsArray, IsDateString, IsNotEmpty, IsString, ValidateNested } from 'class-validator'

export class CredentialReceiverDto {
  @IsString()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsNotEmpty()
  documentType: string

  @IsString()
  @IsNotEmpty()
  documentName: string
}

class CredentialDto {
  @IsArray()
  context: any[]

  @IsString()
  templateId: string

  @IsString()
  schemaId: string

  @IsString()
  schemaVersion: string

  @IsDateString()
  expirationDate: string

  @IsString()
  organization: string

  @IsNotEmpty()
  @ValidateNested()
  credentialSubject: Record<string, any>

  @IsArray()
  type: string[]

  @IsArray()
  tags: string[]

  constructor(
    context: string[],
    templateId: string,
    schemaId: string,
    schemaVersion: string,
    expirationDate: string,
    organization: string,
    credentialSubject: Record<string, any>,
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

export class IssueCredentialRequestDto {
  @IsString()
  @IsNotEmpty()
  issuerId: string

  @ValidateNested()
  credentialReceiver: CredentialReceiverDto

  @ValidateNested()
  credential: CredentialDto
}
