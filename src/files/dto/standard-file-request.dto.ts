import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { ShareRequestAction } from 'src/common/constants/enums'

export class StandardFileRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  readonly userId: string

  @IsString()
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  readonly fileId?: string

  @IsString()
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  readonly requestId?: string
}

export class StandardFileRequestParamsDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  readonly userId: string

  @IsString()
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  readonly fileId?: string

  @IsString()
  @ApiProperty({ example: '65f058277901e68a7df6db35' })
  readonly requestId?: string

  @IsString()
  @ApiProperty({ example: 'ACCEPTED' })
  readonly action?: ShareRequestAction
}
