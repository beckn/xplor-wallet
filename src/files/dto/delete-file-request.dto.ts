import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { FileAction } from 'src/common/constants/enums'

export class DeleteFileRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  readonly userId: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '65f058277901g68a7d6db101' })
  readonly fileId: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'DELETE' })
  readonly action: FileAction
}
