import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator'

export class CreateAccessControlDto {
  constructor(
    vcId: string,
    shareRequestId: string,
    restrictedKey: string,
    restrictedUrl: string,
    fileSignedUrl: string,
    expireTimeStamp: string,
    viewAllowed: boolean,
  ) {
    this.vcId = vcId
    this.shareRequestId = shareRequestId
    this.restrictedKey = restrictedKey
    this.restrictedUrl = restrictedUrl
    this.fileSignedUrl = fileSignedUrl
    this.expireTimeStamp = expireTimeStamp
    this.viewAllowed = viewAllowed
  }

  @IsNotEmpty()
  @IsString()
  readonly vcId: string

  @IsString()
  readonly shareRequestId: string

  @IsNotEmpty()
  @IsString()
  readonly restrictedKey: string

  @IsNotEmpty()
  @IsString()
  readonly restrictedUrl: string

  @IsNotEmpty()
  @IsString()
  readonly fileSignedUrl: string

  @IsNotEmpty()
  @IsNumber()
  readonly expireTimeStamp: string

  @IsNumber()
  @IsPositive()
  readonly viewAllowed: boolean
}
