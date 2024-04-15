import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class GetVCListRequestDto {
  @ApiProperty({ description: 'The wallet ID', example: '65f058277901e68a7df6db35' })
  @IsString({ message: 'walletId must be a string' })
  @IsNotEmpty({ message: 'walletId must not be empty' })
  walletId: string

  @ApiProperty({ description: 'The category of the verifiable credentials', example: '10th Class Result' })
  @IsOptional()
  @IsString({ message: 'category must be a string' })
  category?: string

  @ApiProperty({ description: 'The search query', example: '10th result' })
  @IsOptional()
  @IsString({ message: 'searchQuery must be a string' })
  searchQuery?: string

  @ApiProperty({ description: 'An array of tags', example: ['10th Class Result'] })
  @IsOptional()
  @IsArray({ message: 'tags must be an array' })
  tags?: string[]

  @ApiProperty({ description: 'The page number', example: 1 })
  @IsOptional()
  page: number

  @ApiProperty({ description: 'The size of the page', example: 20 })
  @IsOptional()
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
