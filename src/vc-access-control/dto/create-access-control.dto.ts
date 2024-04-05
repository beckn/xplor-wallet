import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator'

export class CreateAccessControlDto {
  constructor(
    vcId: string,
    shareRequestId: string,
    restrictedKey: string,
    restrictedUrl: string,
    expireTimeStamp: string,
    viewOnce: boolean,
    viewAllowed: boolean,
  ) {
    this.vcId = vcId
    this.shareRequestId = shareRequestId
    this.restrictedKey = restrictedKey
    this.restrictedUrl = restrictedUrl
    this.expireTimeStamp = expireTimeStamp
    this.viewAllowed = viewAllowed
    this.viewOnce = viewOnce
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
  @IsNumber()
  readonly expireTimeStamp: string

  @IsPositive()
  readonly viewAllowed: boolean

  @IsPositive()
  readonly viewOnce: boolean
}
