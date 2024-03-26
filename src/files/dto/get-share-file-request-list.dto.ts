import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'
import { ShareRequestAction } from 'src/common/constants/enums'

export class GetShareFileRequestsDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  documentType?: string

  @ApiProperty()
  @IsString()
  userId: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  status?: ShareRequestAction

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
