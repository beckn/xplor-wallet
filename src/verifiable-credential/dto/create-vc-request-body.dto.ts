import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { VcCategory, VcType } from 'src/common/constants/enums'

export class CreateVCRequestBodyDto {
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
  templateId?: string

  @IsNotEmpty()
  @ApiProperty()
  tags: string[]

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string

  constructor(
    did: string,
    fileId: string,
    walletId: string,
    type: VcType,
    category: string,
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
