import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, ArrayUnique, IsArray, IsNotEmpty, IsString } from 'class-validator'

export class CreateFileRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly userId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly fileType: string

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  readonly fileTags: string[]

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly fileName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly metadata: string
}
