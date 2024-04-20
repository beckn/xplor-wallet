import { IsNotEmpty, IsString } from 'class-validator'

export class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  readonly walletId: string

  @IsString()
  @IsNotEmpty()
  readonly fileType: string

  @IsString()
  @IsNotEmpty()
  readonly storedUrl: string

  @IsString()
  @IsNotEmpty()
  readonly fileKey: string

  constructor(walletId: string, fileType: string, storedUrl: string, fileKey: string) {
    this.walletId = walletId
    this.fileType = fileType
    this.storedUrl = storedUrl
    this.fileKey = fileKey
  }
}
