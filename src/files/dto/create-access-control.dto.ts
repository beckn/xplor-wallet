import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator'

export class CreateAccessControlDto {
  constructor(
    fileId: string,
    shareRequestId: string,
    restrictedKey: string,
    restrictedUrl: string,
    fileSignedUrl: string,
    expireTimeStamp: number,
    allowedViewCount: number,
  ) {
    this.fileId = fileId
    this.shareRequestId = shareRequestId
    this.restrictedKey = restrictedKey
    this.restrictedUrl = restrictedUrl
    this.fileSignedUrl = fileSignedUrl
    this.expireTimeStamp = expireTimeStamp
    this.allowedViewCount = allowedViewCount
  }

  @IsNotEmpty()
  @IsString()
  readonly fileId: string

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
  readonly expireTimeStamp: number

  @IsNumber()
  @IsPositive()
  readonly allowedViewCount: number
}
