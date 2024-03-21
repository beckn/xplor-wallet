import { ArrayNotEmpty, ArrayUnique, IsArray, IsDateString, IsNotEmpty, IsString } from 'class-validator'

export class CredentialApiDto {
  @IsArray()
  @ArrayUnique()
  '@context': any[]

  @IsArray()
  @ArrayUnique()
  type: string[]

  @IsString()
  @IsNotEmpty()
  issuer: string

  @IsDateString()
  issuanceDate: string

  @IsDateString()
  expirationDate: string

  credentialSubject: Record<string, any>

  constructor(
    context: any[],
    type: string[],
    issuer: string,
    issuanceDate: string,
    expirationDate: string,
    credentialSubject: Record<string, any>,
  ) {
    this['@context'] = context
    this.type = type
    this.issuer = issuer
    this.issuanceDate = issuanceDate
    this.expirationDate = expirationDate
    this.credentialSubject = credentialSubject
  }
}
export class IssueCredentialApiRequestDto {
  credential: CredentialApiDto

  @IsString()
  @IsNotEmpty()
  credentialSchemaId: string

  @IsString()
  @IsNotEmpty()
  credentialSchemaVersion: string

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  tags: string[]

  @IsString()
  @IsNotEmpty()
  method: string

  constructor(
    credential: CredentialApiDto,
    credentialSchemaId: string,
    credentialSchemaVersion: string,
    tags: string[],
    method: string,
  ) {
    this.credential = credential
    this.credentialSchemaId = credentialSchemaId
    this.credentialSchemaVersion = credentialSchemaVersion
    this.tags = tags
    this.method = method
  }
}
