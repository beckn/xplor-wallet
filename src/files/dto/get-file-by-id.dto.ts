import { IsNotEmpty, IsString } from 'class-validator'

export class GetFileByFileIdDto {
  @IsNotEmpty()
  readonly userId: string

  @IsNotEmpty()
  @IsString()
  readonly fileId: string

  constructor(userId: string, fileId: string) {
    this.userId = userId
    this.fileId = fileId
  }
}
