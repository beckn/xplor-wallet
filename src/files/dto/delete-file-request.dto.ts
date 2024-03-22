import { IsNotEmpty, IsString } from 'class-validator'
import { FileAction } from 'src/common/constants/enums'

export class DeleteFileRequestDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string

  @IsString()
  @IsNotEmpty()
  readonly fileId: string

  @IsString()
  @IsNotEmpty()
  readonly action: FileAction
}
