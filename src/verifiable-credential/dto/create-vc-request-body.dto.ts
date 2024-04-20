import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator'
import { VcCategory, VcType } from '../../common/constants/enums'

export class CreateVCRequestBodyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'DID must not be empty' })
  did: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'File ID must not be empty' })
  fileId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Wallet ID must not be empty' })
  walletId: string

  @ApiProperty()
  @IsEnum(VcType, { message: 'Invalid VC type' })
  @IsNotEmpty({ message: 'VC Type must not be empty' })
  type: VcType

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'VC Category must not be empty' })
  category: string

  @ApiProperty()
  @IsString()
  templateId?: string

  @ApiProperty()
  @IsArray()
  @IsString({ each: true, message: 'Tags must be strings' })
  @IsNotEmpty({ message: 'Tags must not be empty' })
  tags: string[]

  @ApiProperty()
  @IsString({ message: 'name field must be string' })
  @Length(1, 50, { message: 'Organization must be between 1 and 50 characters' })
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string

  constructor(
    did: string,
    fileId: string,
    walletId: string,
    type: VcType,
    category: VcCategory | string,
    templateId: string,
    tags: string[],
    name: string,
  ) {
    this.did = did
    this.fileId = fileId
    this.walletId = walletId
    this.type = type
    this.category = category
    this.templateId = templateId
    this.tags = tags
    this.name = name
  }
}
