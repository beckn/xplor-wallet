import { IsNotEmpty, IsString } from 'class-validator'
import { ShareRequestAction } from 'src/common/constants/enums'

export class StandardFileRequestDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string

  @IsString()
  readonly fileId?: string

  @IsString()
  readonly requestId?: string
}

export class StandardFileRequestParamsDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string

  @IsString()
  readonly fileId?: string

  @IsString()
  readonly requestId?: string

  @IsString()
  readonly action?: ShareRequestAction
}
