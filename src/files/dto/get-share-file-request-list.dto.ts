import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class GetShareFileRequestsDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  documentType?: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  status?: ['ACCEPTED', 'REJECTED', 'PENDING']

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
}
