import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, ArrayUnique, IsArray, IsNotEmpty, IsString } from 'class-validator'

export class CreateFileRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly walletId: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly category: string

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  readonly tags: string[]

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string
}
