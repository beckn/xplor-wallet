import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'
<<<<<<< HEAD
import { ShareRequestAction } from 'src/common/constants/enums'
=======
>>>>>>> develop

export class GetShareFileRequestsDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  documentType?: string

  @ApiProperty()
<<<<<<< HEAD
  @IsString()
  userId: string

  @ApiProperty()
  @IsOptional()
  @IsString()
  status?: ShareRequestAction
=======
  @IsOptional()
  @IsString()
  status?: ['ACCEPTED', 'REJECTED', 'PENDING']
>>>>>>> develop

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
