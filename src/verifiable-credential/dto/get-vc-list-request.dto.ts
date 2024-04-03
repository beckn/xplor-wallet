import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator'

export class GetVCListRequestDto {
  @ApiProperty()
  @IsString()
  walletId: string

  @ApiProperty({ example: '10th Class Result' })
  @IsOptional()
  @IsString()
  category?: string

  @ApiProperty({ example: '10th result' })
  @IsOptional()
  @IsString()
  searchQuery?: string

  @ApiProperty({ example: ['10th Class Result'] })
  @IsOptional()
  @IsArray()
  tags?: string[]

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize: number

  constructor(
    walletId: string,
    category?: string,
    searchQuery?: string,
    softDeleted?: string,
    tags?: string[],
    page: number = 1,
    pageSize: number = 20,
  ) {
    this.walletId = walletId
    this.searchQuery = searchQuery
    this.category = category
    this.tags = tags
    this.page = page
    this.pageSize = pageSize
  }
}
