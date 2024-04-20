import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { VcCategory, VcType } from '../../common/constants/enums'

export class CreateVCRequestModelDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  did: string

  @IsString()
  @ApiProperty()
  fileId: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  walletId: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  type: VcType

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  category: VcCategory | string

  @IsString()
  @ApiProperty()
  iconUrl?: string

  @IsString()
  @ApiProperty()
  templateId?: string

  @IsNotEmpty()
  @ApiProperty()
  tags: string[]

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  restrictedUrl: string

  constructor(
    did: string,
    fileId: string,
    walletId: string,
    type: VcType,
    category: string,
    iconUrl: string,
    templateId: string,
    tags: string[],
    name: string,
    restrictedUrl: string,
  ) {
    this.did = did
    this.fileId = fileId
    this.walletId = walletId
    this.type = type
    this.category = category
    this.iconUrl = iconUrl
    this.templateId = templateId
    this.tags = tags
    this.name = name
    this.restrictedUrl = restrictedUrl
  }
}
