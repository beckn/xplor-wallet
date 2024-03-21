import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator'

export class GetFilesRequestDto {

  @ApiProperty()
  @IsString()
  userId: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  fileType?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  searchQuery?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  softDeleted?: string

  @ApiProperty()
  @IsOptional()
  @IsArray()
  fileTags?: string[]

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
    userId: string,
    fileType?: string,
    searchQuery?: string,
    softDeleted?: string,
    fileTags?: string[],
    page: number = 1,
    pageSize: number = 20,
  ) {
    this.userId = userId
    this.searchQuery = searchQuery
    this.fileType = fileType
    this.fileTags = fileTags
    this.page = page
    this.pageSize = pageSize
    this.softDeleted = softDeleted
  }
}
