import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class GetFileByFileIdDto {
  @IsNotEmpty()
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  readonly userId: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '65f1758b23e5c12b9bc7c121' })
  readonly fileId: string

  constructor(userId: string, fileId: string) {
    this.userId = userId
    this.fileId = fileId
  }
}
