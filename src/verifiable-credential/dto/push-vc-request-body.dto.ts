import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { VcType } from '../../common/constants/enums'

export class PushVCRequestBodyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'DID must not be empty' })
  did: string

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
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string

  constructor(
    did: string,
    walletId: string,
    type: VcType,
    category: string,
    templateId: string,
    tags: string[],
    name: string,
  ) {
    this.did = did
    this.walletId = walletId
    this.type = type
    this.category = category
    this.templateId = templateId
    this.tags = tags
    this.name = name
  }
}
