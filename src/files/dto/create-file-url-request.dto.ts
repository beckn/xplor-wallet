import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, ArrayUnique, IsArray, IsNotEmpty, IsString } from 'class-validator'

export class CreateFileWithUrlRequestDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Wallet ID cannot be empty' })
  @IsString({ message: 'Wallet ID must be a string' })
  readonly walletId: string

  @ApiProperty()
  @IsNotEmpty({ message: 'Category cannot be empty' })
  @IsString({ message: 'Category must be a string' })
  readonly category: string

  @ApiProperty()
  @IsArray({ message: 'Tags must be an array' })
  @ArrayNotEmpty({ message: 'Tags array cannot be empty' })
  @ArrayUnique({ message: 'Tags array must contain unique values' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  readonly tags: string[]

  @ApiProperty()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  readonly name: string

  @ApiProperty()
  @IsNotEmpty({ message: 'fileUrl cannot be empty' })
  @IsString({ message: 'fileUrl must be a string' })
  readonly fileUrl: string
}
